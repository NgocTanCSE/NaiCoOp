-- ============================================================
-- NaiFarm — 0003: hàm nghiệp vụ (RPC) — nơi giữ bất biến quan trọng
-- Toàn bộ security definer; chỉ cấp execute cho `authenticated`.
-- ============================================================

-- ---------- Ghi kiểm toán ----------
create or replace function fn_audit(p_action text, p_entity text, p_entity_id text, p_meta jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_meta);
end;
$$;

-- ---------- Luật chuyển trạng thái đơn ----------
create or replace function fn_order_transition_ok(p_from order_status, p_to order_status)
returns boolean language sql immutable as $$
  select case p_from
    when 'Pending' then p_to in ('Confirmed', 'Cancelled')
    when 'Confirmed' then p_to in ('Packing', 'Cancelled')
    when 'Packing' then p_to in ('Ready', 'Cancelled')
    when 'Ready' then p_to in ('Shipping', 'Cancelled')
    when 'Shipping' then p_to = 'Completed'
    else false
  end;
$$;

-- ---------- Đặt hàng ----------
-- Nếu p_items null ⇒ lấy từ giỏ hàng của người dùng. Trả về id đơn.
create or replace function fn_place_order(
  p_fulfillment text default 'delivery',
  p_payment_status text default 'COD',
  p_items jsonb default null
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_items jsonb;
  v_item record;
  v_farm text;
  v_product_farm text;
  v_price bigint;
  v_stock numeric;
  v_season season;
  v_batch_code text;
  v_batch_id text;
  v_order_id text;
  v_code text;
  v_ship bigint;
  v_from_cart boolean;
begin
  if v_uid is null then raise exception 'Cần đăng nhập'; end if;

  v_from_cart := (p_items is null or jsonb_array_length(p_items) = 0);
  if v_from_cart then
    select coalesce(jsonb_agg(jsonb_build_object('productId', product_id, 'qtyKg', qty_kg)), '[]'::jsonb)
      into v_items from cart_items where user_id = v_uid;
  else
    v_items := p_items;
  end if;

  if v_items = '[]'::jsonb then raise exception 'Giỏ hàng trống'; end if;

  v_ship := case when p_fulfillment = 'pickup' then 0 else 20000 end;
  v_order_id := 'o-' || substr(md5(random()::text), 1, 8);
  v_code := 'NF-ORD-DEMO-' || upper(substr(md5(random()::text), 1, 6));

  for v_item in select * from jsonb_to_recordset(v_items) as x("productId" text, "qtyKg" numeric)
  loop
    select price_per_kg, farm_id, season, stock_kg, batch_code
      into v_price, v_product_farm, v_season, v_stock, v_batch_code
      from products where id = v_item."productId";
    if not found then raise exception 'Không tìm thấy sản phẩm %', v_item."productId"; end if;
    if v_item."qtyKg" is null or v_item."qtyKg" <= 0 then raise exception 'Số lượng không hợp lệ'; end if;

    if v_farm is null then
      v_farm := v_product_farm;
      insert into orders (id, code, customer_id, farm_id, status, fulfillment, shipping_fee, payment_status)
      values (v_order_id, v_code, v_uid, v_farm, 'Pending', p_fulfillment::fulfillment, v_ship, p_payment_status::payment_status);
      insert into order_history (order_id, status, note)
      values (v_order_id, 'Pending', 'Khách đặt hàng (demo).');
    elsif v_product_farm <> v_farm then
      raise exception 'Đơn demo chỉ hỗ trợ một nhà vườn mỗi đơn';
    end if;

    if v_season = 'in_season' then
      update products set stock_kg = stock_kg - v_item."qtyKg"
        where id = v_item."productId" and stock_kg >= v_item."qtyKg";
      if not found then raise exception 'Không đủ tồn kho cho %', v_item."productId"; end if;
    end if;

    v_batch_id := null;
    if v_batch_code is not null then
      select id into v_batch_id from batches where public_code = v_batch_code;
    end if;

    insert into order_items (order_id, product_id, batch_id, qty_kg, unit_price)
    values (v_order_id, v_item."productId", v_batch_id, v_item."qtyKg", v_price);
  end loop;

  delete from cart_items where user_id = v_uid and v_from_cart;
  perform fn_audit('order.create', 'orders', v_order_id, jsonb_build_object('code', v_code));
  return v_order_id;
end;
$$;

-- ---------- Cập nhật trạng thái đơn ----------
create or replace function fn_set_order_status(p_order_id text, p_next order_status)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order orders%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Cần đăng nhập'; end if;
  select * into v_order from orders where id = p_order_id;
  if not found then raise exception 'Không tìm thấy đơn hàng'; end if;
  if not (v_order.customer_id = v_uid or fn_owns_farm(v_order.farm_id) or fn_is_coordinator()) then
    raise exception 'Không có quyền cập nhật đơn hàng';
  end if;
  if not fn_order_transition_ok(v_order.status, p_next) then
    raise exception 'Chuyển trạng thái % → % không hợp lệ', v_order.status, p_next;
  end if;
  update orders set status = p_next where id = p_order_id;
  insert into order_history (order_id, status, note)
  values (p_order_id, p_next, 'Cập nhật trạng thái (demo).');
  perform fn_audit('order.status', 'orders', p_order_id, jsonb_build_object('to', p_next));
end;
$$;

-- ---------- Nộp minh chứng (nguyên tử: submission + evidence + trạng thái) ----------
create or replace function fn_submit_mission(
  p_mission_id text,
  p_output_note text,
  p_actual_hours numeric,
  p_evidence jsonb default '[]'::jsonb
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_mission missions%rowtype;
  v_version int;
  v_sub_id text;
  v_label text;
begin
  if v_uid is null then raise exception 'Cần đăng nhập'; end if;
  select * into v_mission from missions where id = p_mission_id;
  if not found then raise exception 'Không tìm thấy nhiệm vụ'; end if;
  if v_mission.assignee_id is not null and v_mission.assignee_id <> v_uid then
    raise exception 'Nhiệm vụ đã được giao cho người khác';
  end if;
  if p_output_note is null or length(trim(p_output_note)) = 0 then
    raise exception 'Cần mô tả kết quả';
  end if;
  if p_actual_hours is null or p_actual_hours <= 0 then
    raise exception 'Số giờ không hợp lệ';
  end if;

  select coalesce(max(version), 0) + 1 into v_version
    from mission_submissions where mission_id = p_mission_id;
  v_sub_id := 'sub-' || substr(md5(random()::text), 1, 8);

  insert into mission_submissions (id, mission_id, submitter_id, version, output_note, actual_hours)
  values (v_sub_id, p_mission_id, v_uid, v_version, p_output_note, p_actual_hours);

  if p_evidence is not null then
    for v_label in select value from jsonb_array_elements_text(p_evidence) loop
      insert into submission_evidence (id, submission_id, label)
      values ('ev-' || substr(md5(random()::text), 1, 8), v_sub_id, v_label);
    end loop;
  end if;

  update missions set assignee_id = v_uid, status = 'Submitted' where id = p_mission_id;
  perform fn_audit('mission.submit', 'missions', p_mission_id, jsonb_build_object('submission', v_sub_id));
  return v_sub_id;
end;
$$;

-- ---------- Nhận nhiệm vụ ----------
create or replace function fn_claim_mission(p_mission_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Cần đăng nhập'; end if;
  update missions set assignee_id = v_uid, status = 'Assigned'
    where id = p_mission_id and assignee_id is null and status = 'Open';
  if not found then raise exception 'Nhiệm vụ đã được nhận hoặc không còn mở'; end if;
  perform fn_audit('mission.claim', 'missions', p_mission_id, null);
end;
$$;

-- ---------- Lớp 1: nhà vườn xác nhận đầu ra ----------
create or replace function fn_beneficiary_confirm(p_submission_id text, p_accepted boolean default true, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_sub mission_submissions%rowtype;
  v_mission missions%rowtype;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select * into v_sub from mission_submissions where id = p_submission_id;
  if not found then raise exception 'Không tìm thấy minh chứng'; end if;
  select * into v_mission from missions where id = v_sub.mission_id;
  if not (fn_owns_farm(v_mission.farm_id) or fn_is_admin()) then
    raise exception 'Chỉ nhà vườn được xác nhận đầu ra';
  end if;
  update mission_submissions
    set beneficiary_status = case when p_accepted then 'accepted'::beneficiary_status else 'needs_work'::beneficiary_status end
    where id = p_submission_id;
  update missions
    set status = case when p_accepted then 'BeneficiaryAccepted'::mission_status else 'Revision'::mission_status end
    where id = v_sub.mission_id;
  perform fn_audit('submission.beneficiary', 'mission_submissions', p_submission_id,
    jsonb_build_object('accepted', p_accepted, 'note', p_note));
end;
$$;

-- ---------- Lớp 2: điều phối duyệt giờ (chặn tự duyệt) ----------
create or replace function fn_approve_hours(
  p_submission_id text,
  p_minutes int,
  p_adjustment_of text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_sub mission_submissions%rowtype;
begin
  if not fn_is_coordinator() then raise exception 'Chỉ điều phối viên được duyệt giờ'; end if;
  select * into v_sub from mission_submissions where id = p_submission_id;
  if not found then raise exception 'Không tìm thấy minh chứng'; end if;
  if v_sub.submitter_id = auth.uid() then
    raise exception 'Không thể tự duyệt giờ của chính mình';
  end if;
  if v_sub.beneficiary_status <> 'accepted' then
    raise exception 'Cần nhà vườn xác nhận đầu ra trước (lớp 1)';
  end if;
  if v_sub.review_status = 'approved' then
    raise exception 'Minh chứng đã được duyệt';
  end if;
  if p_minutes is null or p_minutes <= 0 then
    raise exception 'Số phút không hợp lệ';
  end if;

  insert into volunteer_logs
    (mission_id, volunteer_id, submission_id, approved_minutes, reviewer_id, beneficiary_confirmation_id, adjustment_of)
  values
    (v_sub.mission_id, v_sub.submitter_id, p_submission_id, p_minutes, auth.uid(),
     'bc-' || p_submission_id, p_adjustment_of);

  update mission_submissions set review_status = 'approved' where id = p_submission_id;
  update missions set status = 'Recorded' where id = v_sub.mission_id;
  perform fn_audit('hours.approve', 'mission_submissions', p_submission_id, jsonb_build_object('minutes', p_minutes));
end;
$$;

-- ---------- Từ chối / yêu cầu sửa minh chứng ----------
create or replace function fn_reject_submission(p_submission_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_mission_id text;
begin
  if not fn_is_coordinator() then raise exception 'Chỉ điều phối viên được thực hiện'; end if;
  select mission_id into v_mission_id from mission_submissions where id = p_submission_id;
  if not found then raise exception 'Không tìm thấy minh chứng'; end if;
  update mission_submissions set review_status = 'revision' where id = p_submission_id;
  update missions set status = 'Revision' where id = v_mission_id;
  perform fn_audit('submission.reject', 'mission_submissions', p_submission_id, null);
end;
$$;

-- ---------- Đối chiếu chứng nhận (chỉ tiến từng bước) ----------
create or replace function fn_match_certificate(
  p_cert_id text,
  p_to certificate_status,
  p_note text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_cert certificates%rowtype;
begin
  if not fn_is_coordinator() then raise exception 'Chỉ điều phối viên được đối chiếu hồ sơ'; end if;
  select * into v_cert from certificates where id = p_cert_id;
  if not found then raise exception 'Không tìm thấy chứng nhận'; end if;
  if not (
    (v_cert.verification_status = 'self_declared' and p_to = 'document_matched')
    or (v_cert.verification_status = 'document_matched' and p_to = 'source_confirmed')
  ) then
    raise exception 'Chuyển trạng thái chứng nhận không hợp lệ';
  end if;
  update certificates
    set verification_status = p_to, reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note
    where id = p_cert_id;
  perform fn_audit('certificate.match', 'certificates', p_cert_id, jsonb_build_object('to', p_to));
end;
$$;

-- ---------- Cấp quyền gọi ----------
grant execute on function fn_place_order(text, text, jsonb) to authenticated;
grant execute on function fn_submit_mission(text, text, numeric, jsonb) to authenticated;
grant execute on function fn_set_order_status(text, order_status) to authenticated;
grant execute on function fn_claim_mission(text) to authenticated;
grant execute on function fn_beneficiary_confirm(text, boolean, text) to authenticated;
grant execute on function fn_approve_hours(text, int, text) to authenticated;
grant execute on function fn_reject_submission(text) to authenticated;
grant execute on function fn_match_certificate(text, certificate_status, text) to authenticated;
