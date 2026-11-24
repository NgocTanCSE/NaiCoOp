-- ============================================================
-- NaiFarm — 0004: kho lưu trữ ảnh (Supabase Storage)
-- Ảnh sản phẩm / nhà vườn / minh chứng nhiệm vụ.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('farm-images', 'farm-images', true),
  ('mission-evidence', 'mission-evidence', false)
on conflict (id) do nothing;

-- Đọc: ảnh công khai cho mọi người; minh chứng chỉ người liên quan (đơn giản hoá: đã đăng nhập).
create policy storage_public_read on storage.objects for select to anon, authenticated
  using (bucket_id in ('product-images', 'farm-images'));

create policy storage_evidence_read on storage.objects for select to authenticated
  using (bucket_id = 'mission-evidence');

-- Ghi: người dùng đã đăng nhập tải lên trong các bucket cho phép.
create policy storage_write on storage.objects for insert to authenticated
  with check (bucket_id in ('product-images', 'farm-images', 'mission-evidence'));

create policy storage_update on storage.objects for update to authenticated
  using (owner = auth.uid() or bucket_id in ('product-images', 'farm-images', 'mission-evidence'));
