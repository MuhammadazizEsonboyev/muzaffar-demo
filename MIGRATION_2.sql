-- =====================================================================
-- PUMP MONITORING — MIGRATION 2
-- Yangi modullar: Mnemoschema, Ish-naryad (CMMS), Smena jurnali,
-- Qism iste'moli, KPI/OEE uchun qo'shimcha maydonlar.
-- Supabase SQL Editor'da to'liq nusxa-joylashtiring va RUN bosing.
-- (Idempotent — qayta ishga tushirsa ham xato bermaydi)
-- =====================================================================

-- ---------- ENUM'lar ----------
do $$ begin
  create type wo_status as enum ('open','assigned','in_progress','on_hold','completed','cancelled');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type wo_priority as enum ('low','medium','high','urgent');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type wo_type as enum ('corrective','preventive','inspection');
  exception when duplicate_object then null;
end $$;

-- ---------- PUMPS: mnemoschema + KPI uchun qo'shimcha ustunlar ----------
alter table public.pumps add column if not exists workshop      text;          -- Sex nomi (Sex A, Sex B...)
alter table public.pumps add column if not exists pos_x         numeric(6,2);  -- mnemoschemada X (0-100 %)
alter table public.pumps add column if not exists pos_y         numeric(6,2);  -- mnemoschemada Y (0-100 %)
alter table public.pumps add column if not exists service_interval_hours int default 5000; -- profilaktika oralig'i
alter table public.pumps add column if not exists last_service_hours    numeric(12,1) default 0; -- oxirgi xizmatdagi soat

-- Seed: mavjud nasoslarga sex va koordinata beramiz (mnemoschema uchun)
update public.pumps set workshop='Sex A', pos_x=18, pos_y=30 where serial_number='GF-NB-0001';
update public.pumps set workshop='Sex A', pos_x=18, pos_y=68 where serial_number='KSB-ET-0002';
update public.pumps set workshop='Sex B', pos_x=50, pos_y=30 where serial_number='WL-IL-0003';
update public.pumps set workshop='Sex B', pos_x=50, pos_y=68 where serial_number='GF-NK-0004';
update public.pumps set workshop='Sex C', pos_x=82, pos_y=30 where serial_number='KSB-MV-0005';
update public.pumps set workshop='Sex C', pos_x=82, pos_y=68 where serial_number='WL-HX-0006';

-- ---------- WORK ORDERS (Ish-naryad) ----------
create table if not exists public.work_orders (
  id            uuid primary key default uuid_generate_v4(),
  wo_number     text unique not null default ('WO-' || to_char(now(),'YYMMDD') || '-' || substr(uuid_generate_v4()::text,1,4)),
  pump_id       uuid references public.pumps(id) on delete set null,
  alert_id      uuid references public.alerts(id) on delete set null,
  type          wo_type     not null default 'corrective',
  title         text not null,
  description   text,
  status        wo_status   not null default 'open',
  priority      wo_priority not null default 'medium',
  assigned_to   uuid references public.users(id) on delete set null,
  labor_hours   numeric(8,1) default 0,        -- sarflangan soat
  labor_cost    numeric(12,2) default 0,       -- ish haqi xarajati
  parts_cost    numeric(12,2) default 0,       -- qism xarajati
  created_at    timestamptz not null default now(),
  started_at    timestamptz,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now()
);
create index if not exists idx_wo_pump   on public.work_orders(pump_id);
create index if not exists idx_wo_status on public.work_orders(status);
create index if not exists idx_wo_created on public.work_orders(created_at desc);

-- ---------- WORK ORDER PARTS (ish-naryadda ishlatilgan qismlar) ----------
create table if not exists public.work_order_parts (
  id          uuid primary key default uuid_generate_v4(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  inventory_id  uuid not null references public.inventory(id) on delete restrict,
  quantity      int not null check (quantity > 0),
  unit_cost     numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_wop_wo on public.work_order_parts(work_order_id);

-- inventory'ga narx ustuni (xarajat hisobi uchun)
alter table public.inventory add column if not exists unit_cost numeric(12,2) default 0;
update public.inventory set unit_cost=85000  where part_code='BRG-6310';
update public.inventory set unit_cost=120000 where part_code='SEAL-045';
update public.inventory set unit_cost=950000 where part_code='IMP-250';
update public.inventory set unit_cost=45000  where part_code='CPL-STD';
update public.inventory set unit_cost=30000  where part_code='ORG-KIT';
update public.inventory set unit_cost=72000  where part_code='BRG-6208';

-- ---------- SHIFT LOGS (Smena topshirig'i jurnali) ----------
create table if not exists public.shift_logs (
  id           uuid primary key default uuid_generate_v4(),
  shift_name   text not null,                  -- "1-smena", "Tungi smena"
  operator     text not null,                  -- topshirayotgan operator ismi
  received_by  text,                           -- qabul qiluvchi
  summary      text not null,                  -- holat bayoni
  open_issues  text,                           -- ochiq muammolar
  shift_date   date not null default current_date,
  created_at   timestamptz not null default now()
);
create index if not exists idx_shift_date on public.shift_logs(shift_date desc);

-- ---------- updated_at trigger work_orders uchun ----------
do $$ begin
  create trigger trg_wo_updated before update on public.work_orders
    for each row execute function public.set_updated_at();
  exception when duplicate_object then null;
end $$;

-- ---------- RLS yangi jadvallar uchun ----------
alter table public.work_orders      enable row level security;
alter table public.work_order_parts enable row level security;
alter table public.shift_logs       enable row level security;

drop policy if exists wo_read on public.work_orders;
create policy wo_read on public.work_orders for select using (auth.uid() is not null);

drop policy if exists wop_read on public.work_order_parts;
create policy wop_read on public.work_order_parts for select using (auth.uid() is not null);

drop policy if exists shift_read on public.shift_logs;
create policy shift_read on public.shift_logs for select using (auth.uid() is not null);

-- Realtime
do $$ begin
  alter publication supabase_realtime add table public.work_orders;
  exception when duplicate_object then null;
end $$;

-- ---------- SEED: namuna ish-naryadlar va smena yozuvlari ----------
insert into public.work_orders (pump_id, type, title, description, status, priority, labor_hours, labor_cost, parts_cost, created_at, completed_at)
select id, 'corrective', 'Podshipnik almashtirish', 'Yuqori vibratsiya sababli', 'completed', 'high', 4, 600000, 170000, now() - interval '8 days', now() - interval '8 days'
from public.pumps where serial_number='WL-IL-0003';

insert into public.work_orders (pump_id, type, title, description, status, priority, created_at)
select id, 'corrective', 'Ishchi g''ildirakni almashtirish', 'Yeyilish aniqlandi, sarf pasaygan', 'in_progress', 'urgent', now() - interval '1 day'
from public.pumps where serial_number='GF-NK-0004';

insert into public.work_orders (pump_id, type, title, description, status, priority, created_at)
select id, 'preventive', 'Rejali yog''lash', '5000 soatlik profilaktika', 'open', 'medium', now()
from public.pumps where serial_number='GF-NB-0001';

insert into public.shift_logs (shift_name, operator, received_by, summary, open_issues, shift_date)
values
 ('1-smena', 'A. Karimov', 'B. Tursunov', 'Barcha nasoslar normal rejimda. Nasos-04 kuzatuvda.', 'Nasos-04 ishchi g''ildirak almashtirish kutilmoqda', current_date),
 ('Tungi smena', 'B. Tursunov', null, 'Nasos-03 da vibratsiya ko''tarildi, ish-naryad ochildi.', 'Nasos-03 podshipnik nazorati', current_date - 1);

-- =====================================================================
-- TAYYOR. Migration 2 muvaffaqiyatli o'rnatildi.
-- =====================================================================
