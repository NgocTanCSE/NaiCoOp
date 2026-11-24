-- ============================================================
-- NaiFarm — 0001: schema gốc
-- Phản chiếu 1:1 `naifarm-prototype/src/lib/seed.ts`.
-- Mọi bảng dữ liệu demo đều có cờ `is_demo` (mặc định true).
-- ============================================================

-- ---------- Enum ----------
create type workspace as enum ('W01', 'W02', 'W03', 'W04', 'W06');
create type app_role as enum ('farm_owner', 'volunteer', 'customer', 'local_coordinator', 'platform_admin');
create type unit_type as enum ('phuong', 'xa');
create type cert_status as enum ('self_declared', 'document_matched', 'source_confirmed', 'none');
create type source_status as enum ('self_declared', 'volunteer_recorded', 'document_matched', 'source_confirmed');
create type season as enum ('in_season', 'preorder', 'out_of_stock');
create type diary_phase as enum ('khoi_tao', 'cham_soc', 'thu_hoach', 'phan_loai', 'giao_nhan');
create type order_status as enum ('Pending', 'Confirmed', 'Packing', 'Ready', 'Shipping', 'Completed', 'Cancelled');
create type fulfillment as enum ('delivery', 'pickup');
create type payment_status as enum ('Unpaid', 'Paid', 'COD');
create type mission_status as enum ('Open', 'Assigned', 'InProgress', 'Submitted', 'Revision', 'BeneficiaryAccepted', 'Approved', 'Recorded', 'Cancelled');
create type mission_mode as enum ('online', 'onsite', 'hybrid');
create type beneficiary_status as enum ('pending', 'accepted', 'needs_work');
create type review_status as enum ('pending', 'approved', 'revision');
create type livestream_status as enum ('scheduled', 'live', 'ended', 'cancelled');
create type certificate_status as enum ('self_declared', 'document_matched', 'source_confirmed', 'expired', 'revoked');

-- ---------- Đơn vị hành chính ----------
create table admin_units (
  code text primary key,
  name text not null,
  type unit_type not null
);

-- ---------- Hồ sơ người dùng (gắn auth.users) ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  legacy_id text unique,
  display_name text not null,
  age int,
  role app_role not null default 'customer',
  workspace workspace not null default 'W01',
  unit_code text references admin_units (code),
  home text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Nhà vườn ----------
create table farms (
  id text primary key,
  owner_id uuid references profiles (id) on delete set null,
  name text not null,
  owner text not null default '',
  story text not null default '',
  unit_code text references admin_units (code),
  address text not null default '',
  area_ha numeric not null default 0,
  crops text[] not null default '{}',
  lat numeric not null default 0,
  lng numeric not null default 0,
  cert_status cert_status not null default 'self_declared',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Sản phẩm ----------
create table products (
  id text primary key,
  farm_id text not null references farms (id) on delete cascade,
  name text not null,
  category text not null default 'Trái cây',
  price_per_kg bigint not null check (price_per_kg >= 0),
  unit text not null default 'kg',
  stock_kg numeric not null default 0 check (stock_kg >= 0),
  season season not null default 'in_season',
  description text not null default '',
  batch_code text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_farm_idx on products (farm_id);
create index products_name_idx on products (lower(name));

-- ---------- Lô hàng + nhật ký ----------
create table batches (
  id text primary key,
  product_id text not null references products (id) on delete cascade,
  farm_id text not null references farms (id) on delete cascade,
  public_code text not null unique,
  harvest_date date not null,
  quantity_kg numeric not null default 0,
  source_status source_status not null default 'self_declared',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
create index batches_farm_idx on batches (farm_id);

create table diary_events (
  id text primary key,
  batch_id text not null references batches (id) on delete cascade,
  at date not null,
  phase diary_phase not null,
  note text not null,
  actor text not null default '',
  evidence text,
  created_at timestamptz not null default now()
);
create index diary_batch_idx on diary_events (batch_id, at);

-- ---------- Giỏ hàng ----------
create table carts (
  id text primary key default ('c-' || substr(md5(random()::text), 1, 8)),
  user_id uuid not null unique references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table cart_items (
  id text primary key default ('ci-' || substr(md5(random()::text), 1, 8)),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id text not null references products (id) on delete cascade,
  qty_kg numeric not null check (qty_kg > 0),
  unique (user_id, product_id)
);

-- ---------- Đơn hàng ----------
create table orders (
  id text primary key,
  code text not null unique,
  customer_id uuid not null references profiles (id),
  farm_id text not null references farms (id),
  status order_status not null default 'Pending',
  fulfillment fulfillment not null default 'delivery',
  shipping_fee bigint not null default 0,
  payment_status payment_status not null default 'COD',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
create index orders_customer_idx on orders (customer_id, created_at desc);
create index orders_farm_idx on orders (farm_id, created_at desc);

create table order_items (
  id text primary key default ('oi-' || substr(md5(random()::text), 1, 8)),
  order_id text not null references orders (id) on delete cascade,
  product_id text not null references products (id),
  batch_id text references batches (id),
  qty_kg numeric not null check (qty_kg > 0),
  unit_price bigint not null check (unit_price >= 0)
);
create index order_items_order_idx on order_items (order_id);

create table order_history (
  id text primary key default ('oh-' || substr(md5(random()::text), 1, 8)),
  order_id text not null references orders (id) on delete cascade,
  at timestamptz not null default now(),
  status order_status not null,
  note text not null default ''
);
create index order_history_order_idx on order_history (order_id, at);

-- ---------- Yêu cầu hỗ trợ / Nhiệm vụ ----------
create table support_requests (
  id text primary key,
  farm_id text not null references farms (id) on delete cascade,
  title text not null,
  need text not null default '',
  desired_output text not null default '',
  status text not null default 'Open',
  created_at timestamptz not null default now()
);

create table missions (
  id text primary key,
  request_id text references support_requests (id) on delete set null,
  farm_id text not null references farms (id) on delete cascade,
  title text not null,
  goal text not null default '',
  output text not null default '',
  skill text not null default '',
  mode mission_mode not null default 'onsite',
  expected_hours numeric not null default 0,
  due_date date,
  assignee_id uuid references profiles (id) on delete set null,
  slots int not null default 1,
  unit_code text references admin_units (code),
  status mission_status not null default 'Open',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
create index missions_farm_idx on missions (farm_id);
create index missions_assignee_idx on missions (assignee_id);

create table mission_submissions (
  id text primary key,
  mission_id text not null references missions (id) on delete cascade,
  submitter_id uuid not null references profiles (id),
  version int not null default 1,
  output_note text not null default '',
  actual_hours numeric not null default 0,
  beneficiary_status beneficiary_status not null default 'pending',
  review_status review_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index submissions_mission_idx on mission_submissions (mission_id, version desc);

create table submission_evidence (
  id text primary key default ('ev-' || substr(md5(random()::text), 1, 8)),
  submission_id text not null references mission_submissions (id) on delete cascade,
  label text not null,
  storage_path text
);

create table volunteer_logs (
  id text primary key default ('vl-' || substr(md5(random()::text), 1, 8)),
  mission_id text not null references missions (id) on delete cascade,
  volunteer_id uuid not null references profiles (id),
  submission_id text not null references mission_submissions (id) on delete cascade,
  approved_minutes int not null check (approved_minutes > 0),
  reviewer_id uuid not null references profiles (id),
  beneficiary_confirmation_id text not null default '',
  adjustment_of text,
  at timestamptz not null default now()
);
create index volunteer_logs_vol_idx on volunteer_logs (volunteer_id, at desc);

-- ---------- Livestream ----------
create table livestreams (
  id text primary key,
  farm_id text not null references farms (id) on delete cascade,
  host_id uuid not null references profiles (id),
  title text not null,
  scheduled_at timestamptz not null,
  duration_min int not null default 30,
  status livestream_status not null default 'scheduled',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
create index livestreams_sched_idx on livestreams (scheduled_at desc);

create table livestream_products (
  livestream_id text not null references livestreams (id) on delete cascade,
  product_id text not null references products (id) on delete cascade,
  primary key (livestream_id, product_id)
);

-- ---------- Chứng nhận / chứng từ ----------
create table certificates (
  id text primary key,
  farm_id text not null references farms (id) on delete cascade,
  product_id text references products (id) on delete set null,
  issuer text not null default '',
  type text not null default '',
  validity text,
  verification_status certificate_status not null default 'self_declared',
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);
create index certificates_farm_idx on certificates (farm_id);

-- ---------- Bài học (W03) ----------
create table lessons (
  id text primary key,
  title text not null,
  audience text not null default 'thpt',
  subject text not null default '',
  minutes int not null default 0,
  objectives text[] not null default '{}',
  is_demo boolean not null default true
);

-- ---------- Kiểm toán ----------
create table audit_log (
  id text primary key default ('al-' || substr(md5(random()::text), 1, 12)),
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  at timestamptz not null default now(),
  meta jsonb
);
create index audit_log_at_idx on audit_log (at desc);
