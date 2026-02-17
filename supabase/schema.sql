create extension if not exists "pgcrypto";

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create or replace function public.can_access_gym(gym uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and gym_id = $1
  );
$$;

create or replace function public.is_manager(gym uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and gym_id = $1
      and role in ('owner', 'manager')
  );
$$;

create table if not exists public.gyms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  city text,
  state text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gym_id uuid references public.gyms(id) on delete set null,
  role text default 'owner',
  created_at timestamptz default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  name text not null,
  address text,
  city text,
  state text,
  timezone text,
  created_at timestamptz default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_code text,
  full_name text not null,
  email text,
  phone text,
  status text default 'active',
  membership_type text,
  joined_on date default current_date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  billing_cycle text default 'monthly',
  tier text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  plan_id uuid references public.membership_plans(id) on delete set null,
  status text default 'active',
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  full_name text not null,
  role text,
  phone text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  start_at timestamptz,
  end_at timestamptz,
  status text default 'scheduled',
  created_at timestamptz default now()
);

create table if not exists public.payroll_entries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  period_start date,
  period_end date,
  amount numeric(10,2) not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  title text not null,
  coach text,
  intensity text,
  capacity integer,
  duration_min integer,
  created_at timestamptz default now()
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  session_date date not null,
  start_time time not null,
  enrolled integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  start_at timestamptz,
  end_at timestamptz,
  status text default 'scheduled',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  class_session_id uuid references public.class_sessions(id) on delete set null,
  status text default 'booked',
  booked_at timestamptz default now()
);

create table if not exists public.waitlists (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  class_session_id uuid references public.class_sessions(id) on delete set null,
  status text default 'waiting',
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  amount numeric(10, 2) not null,
  status text default 'paid',
  paid_on date,
  method text,
  invoice_no text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  name text not null,
  sku text,
  price numeric(10,2) not null,
  stock integer default 0,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  total numeric(10,2) not null,
  status text default 'paid',
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer default 1,
  price numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  name text not null,
  channel text,
  status text default 'draft',
  start_at date,
  end_at date,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  recipient text,
  status text default 'queued',
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  code text not null,
  discount_percent integer,
  status text default 'active',
  expires_on date,
  created_at timestamptz default now()
);

create table if not exists public.loyalty_rewards (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  points integer default 0,
  tier text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  referrer_member_id uuid references public.members(id) on delete set null,
  referee_name text,
  reward_status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  name text not null,
  report_type text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.widgets (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  name text not null,
  embed_code text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  title text not null,
  status text default 'active',
  views integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  theme text,
  primary_color text,
  created_at timestamptz default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  provider text,
  status text default 'inactive',
  connected_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  title text not null,
  form_type text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.waivers (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  title text not null,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.waiver_signatures (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  waiver_id uuid references public.waivers(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  signed_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  source text,
  stage text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.finance_offers (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  provider text,
  amount numeric(10,2),
  status text default 'offered',
  created_at timestamptz default now()
);

do $$
declare t text;
begin
  foreach t in array array[
    'class_sessions','appointments','bookings','waitlists','payments',
    'orders','order_items','messages','waiver_signatures'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'alter table public.%I add column if not exists gym_id uuid references public.gyms(id) on delete cascade',
        t
      );
    end if;
  end loop;
end $$;

alter table public.members
  add column if not exists member_code text;

alter table public.gyms enable row level security;
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.members enable row level security;
alter table public.membership_plans enable row level security;
alter table public.memberships enable row level security;
alter table public.staff enable row level security;
alter table public.staff_shifts enable row level security;
alter table public.payroll_entries enable row level security;
alter table public.classes enable row level security;
alter table public.class_sessions enable row level security;
alter table public.appointments enable row level security;
alter table public.bookings enable row level security;
alter table public.waitlists enable row level security;
alter table public.payments enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.campaigns enable row level security;
alter table public.messages enable row level security;
alter table public.promo_codes enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.referrals enable row level security;
alter table public.reports enable row level security;
alter table public.widgets enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.app_settings enable row level security;
alter table public.integrations enable row level security;
alter table public.forms enable row level security;
alter table public.waivers enable row level security;
alter table public.waiver_signatures enable row level security;
alter table public.leads enable row level security;
alter table public.finance_offers enable row level security;

create policy "Profiles are self-managed"
  on public.profiles for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Owners can manage gyms"
  on public.gyms for all
  to authenticated
  using (
    owner_id = auth.uid()
    or id in (select gym_id from public.profiles where user_id = auth.uid())
  )
  with check (owner_id = auth.uid());

create policy "Gym members can read locations"
  on public.locations for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage locations"
  on public.locations for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read members"
  on public.members for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage members"
  on public.members for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read membership plans"
  on public.membership_plans for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage membership plans"
  on public.membership_plans for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read memberships"
  on public.memberships for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage memberships"
  on public.memberships for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read staff"
  on public.staff for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage staff"
  on public.staff for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read staff shifts"
  on public.staff_shifts for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage staff shifts"
  on public.staff_shifts for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read payroll entries"
  on public.payroll_entries for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage payroll entries"
  on public.payroll_entries for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read classes"
  on public.classes for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage classes"
  on public.classes for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read class sessions"
  on public.class_sessions for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage class sessions"
  on public.class_sessions for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read appointments"
  on public.appointments for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage appointments"
  on public.appointments for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read bookings"
  on public.bookings for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage bookings"
  on public.bookings for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read waitlists"
  on public.waitlists for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage waitlists"
  on public.waitlists for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read payments"
  on public.payments for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage payments"
  on public.payments for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read products"
  on public.products for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage products"
  on public.products for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read orders"
  on public.orders for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage orders"
  on public.orders for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read order items"
  on public.order_items for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage order items"
  on public.order_items for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read campaigns"
  on public.campaigns for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage campaigns"
  on public.campaigns for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read messages"
  on public.messages for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage messages"
  on public.messages for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read promo codes"
  on public.promo_codes for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage promo codes"
  on public.promo_codes for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read loyalty rewards"
  on public.loyalty_rewards for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage loyalty rewards"
  on public.loyalty_rewards for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read referrals"
  on public.referrals for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage referrals"
  on public.referrals for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read reports"
  on public.reports for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage reports"
  on public.reports for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read widgets"
  on public.widgets for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage widgets"
  on public.widgets for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read marketplace listings"
  on public.marketplace_listings for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage marketplace listings"
  on public.marketplace_listings for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read app settings"
  on public.app_settings for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage app settings"
  on public.app_settings for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read integrations"
  on public.integrations for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage integrations"
  on public.integrations for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read forms"
  on public.forms for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage forms"
  on public.forms for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read waivers"
  on public.waivers for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage waivers"
  on public.waivers for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read waiver signatures"
  on public.waiver_signatures for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage waiver signatures"
  on public.waiver_signatures for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read leads"
  on public.leads for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage leads"
  on public.leads for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));

create policy "Gym members can read finance offers"
  on public.finance_offers for select
  to authenticated
  using (public.can_access_gym(gym_id));

create policy "Managers can manage finance offers"
  on public.finance_offers for all
  to authenticated
  using (public.is_manager(gym_id))
  with check (public.is_manager(gym_id));
