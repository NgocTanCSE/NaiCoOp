-- ============================================================
-- NaiFarm — 0002: quyền truy cập (RLS) + đồng bộ hồ sơ khi tạo tài khoản
-- ============================================================

-- ---------- Cấp quyền cơ bản ----------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ---------- Hàm phụ trợ (security definer: bỏ qua RLS để kiểm tra quyền) ----------
create or replace function fn_my_role() returns app_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function fn_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'platform_admin' from profiles where id = auth.uid()), false);
$$;

create or replace function fn_is_coordinator() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('local_coordinator', 'platform_admin') from profiles where id = auth.uid()), false);
$$;

create or replace function fn_owns_farm(p_farm_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from farms where id = p_farm_id and owner_id = auth.uid());
$$;

create or replace function fn_owns_batch(p_batch_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from batches b join farms f on f.id = b.farm_id
    where b.id = p_batch_id and f.owner_id = auth.uid()
  );
$$;

create or replace function fn_owns_mission(p_mission_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from missions m join farms f on f.id = m.farm_id
    where m.id = p_mission_id and f.owner_id = auth.uid()
  );
$$;

create or replace function fn_can_read_order(p_order_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from orders o
    where o.id = p_order_id
      and (o.customer_id = auth.uid() or fn_owns_farm(o.farm_id) or fn_is_coordinator())
  );
$$;

create or replace function fn_submission_owner(p_submission_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from mission_submissions s
    where s.id = p_submission_id and s.submitter_id = auth.uid()
  );
$$;

create or replace function fn_can_read_submission(p_submission_id text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from mission_submissions s join missions m on m.id = s.mission_id
    where s.id = p_submission_id
      and (s.submitter_id = auth.uid() or fn_owns_farm(m.farm_id) or fn_is_coordinator())
  );
$$;

-- ---------- Đồng bộ hồ sơ khi có tài khoản mới ----------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, legacy_id, display_name, age, role, workspace, unit_code, home)
  values (
    new.id,
    new.raw_user_meta_data ->> 'legacy_id',
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'age', '')::int,
    coalesce(nullif(new.raw_user_meta_data ->> 'role', '')::app_role, 'customer'),
    coalesce(nullif(new.raw_user_meta_data ->> 'workspace', '')::workspace, 'W01'),
    new.raw_user_meta_data ->> 'unit_code',
    new.raw_user_meta_data ->> 'home'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Bật RLS ----------
alter table admin_units enable row level security;
alter table profiles enable row level security;
alter table farms enable row level security;
alter table products enable row level security;
alter table batches enable row level security;
alter table diary_events enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_history enable row level security;
alter table support_requests enable row level security;
alter table missions enable row level security;
alter table mission_submissions enable row level security;
alter table submission_evidence enable row level security;
alter table volunteer_logs enable row level security;
alter table livestreams enable row level security;
alter table livestream_products enable row level security;
alter table certificates enable row level security;
alter table lessons enable row level security;
alter table audit_log enable row level security;

-- ---------- Chính sách ----------
-- admin_units: đọc công khai
create policy admin_units_read on admin_units for select to anon, authenticated using (true);
create policy admin_units_write on admin_units for all to authenticated using (fn_is_admin()) with check (fn_is_admin());

-- profiles: chỉ đọc/sửa của mình; admin toàn quyền
create policy profiles_read_self on profiles for select to authenticated using (id = auth.uid() or fn_is_admin());
create policy profiles_update_self on profiles for update to authenticated using (id = auth.uid() or fn_is_admin()) with check (id = auth.uid() or fn_is_admin());

-- farms: đọc công khai; chủ vườn/Admin ghi
create policy farms_read on farms for select to anon, authenticated using (true);
create policy farms_write on farms for all to authenticated using (owner_id = auth.uid() or fn_is_admin()) with check (owner_id = auth.uid() or fn_is_admin());

-- products
create policy products_read on products for select to anon, authenticated using (true);
create policy products_write on products for all to authenticated using (fn_owns_farm(farm_id) or fn_is_admin()) with check (fn_owns_farm(farm_id) or fn_is_admin());

-- batches
create policy batches_read on batches for select to anon, authenticated using (true);
create policy batches_write on batches for all to authenticated using (fn_owns_farm(farm_id) or fn_is_admin()) with check (fn_owns_farm(farm_id) or fn_is_admin());

-- diary_events
create policy diary_read on diary_events for select to anon, authenticated using (true);
create policy diary_write on diary_events for all to authenticated using (fn_owns_batch(batch_id) or fn_is_admin()) with check (fn_owns_batch(batch_id) or fn_is_admin());

-- carts / cart_items: chỉ chủ sở hữu
create policy carts_own on carts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_own on cart_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: khách của mình, chủ vườn, điều phối, admin
create policy orders_read on orders for select to authenticated
  using (customer_id = auth.uid() or fn_owns_farm(farm_id) or fn_is_coordinator());
create policy order_items_read on order_items for select to authenticated using (fn_can_read_order(order_id));
create policy order_history_read on order_history for select to authenticated using (fn_can_read_order(order_id));

-- support_requests
create policy support_read on support_requests for select to authenticated using (fn_owns_farm(farm_id) or fn_is_coordinator());
create policy support_write on support_requests for all to authenticated using (fn_owns_farm(farm_id) or fn_is_admin()) with check (fn_owns_farm(farm_id) or fn_is_admin());

-- missions: đọc công khai (nhiệm vụ mở); chủ vườn/điều phối ghi
create policy missions_read on missions for select to authenticated using (true);
create policy missions_write on missions for all to authenticated using (fn_owns_farm(farm_id) or fn_is_coordinator()) with check (fn_owns_farm(farm_id) or fn_is_coordinator());

-- mission_submissions
create policy submissions_read on mission_submissions for select to authenticated using (fn_can_read_submission(id));
create policy submissions_insert on mission_submissions for insert to authenticated with check (submitter_id = auth.uid());
create policy submissions_update on mission_submissions for update to authenticated using (fn_submission_owner(id) or fn_is_coordinator()) with check (fn_submission_owner(id) or fn_is_coordinator());

-- submission_evidence
create policy evidence_read on submission_evidence for select to authenticated using (fn_can_read_submission(submission_id));
create policy evidence_write on submission_evidence for all to authenticated using (fn_submission_owner(submission_id) or fn_is_coordinator()) with check (fn_submission_owner(submission_id) or fn_is_coordinator());

-- volunteer_logs: chỉ đọc; ghi qua RPC (security definer)
create policy volunteer_logs_read on volunteer_logs for select to authenticated using (volunteer_id = auth.uid() or fn_is_coordinator());

-- livestreams: đọc công khai; người dẫn/Admin ghi
create policy livestreams_read on livestreams for select to anon, authenticated using (true);
create policy livestreams_write on livestreams for all to authenticated using (host_id = auth.uid() or fn_is_admin()) with check (host_id = auth.uid() or fn_is_admin());
create policy livestream_products_read on livestream_products for select to anon, authenticated using (true);
create policy livestream_products_write on livestream_products for all to authenticated
  using (exists (select 1 from livestreams l where l.id = livestream_id and l.host_id = auth.uid()) or fn_is_admin())
  with check (exists (select 1 from livestreams l where l.id = livestream_id and l.host_id = auth.uid()) or fn_is_admin());

-- certificates: đọc công khai; chủ vườn tạo; điều phối cập nhật (qua RPC)
create policy certificates_read on certificates for select to anon, authenticated using (true);
create policy certificates_write on certificates for all to authenticated using (fn_owns_farm(farm_id) or fn_is_coordinator()) with check (fn_owns_farm(farm_id) or fn_is_coordinator());

-- lessons
create policy lessons_read on lessons for select to anon, authenticated using (true);
create policy lessons_write on lessons for all to authenticated using (fn_is_admin()) with check (fn_is_admin());

-- audit_log: chỉ admin đọc; ghi qua trigger (security definer)
create policy audit_read on audit_log for select to authenticated using (fn_is_admin());
