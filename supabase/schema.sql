create extension if not exists "pgcrypto";

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

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid references public.gyms(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  status text default 'active',
  membership_type text,
  joined_on date default current_date,
  notes text,
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
  class_id uuid references public.classes(id) on delete cascade,
  session_date date not null,
  start_time time not null,
  enrolled integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  amount numeric(10, 2) not null,
  status text default 'paid',
  paid_on date,
  method text,
  invoice_no text,
  created_at timestamptz default now()
);

alter table public.gyms enable row level security;
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.staff enable row level security;
alter table public.classes enable row level security;
alter table public.class_sessions enable row level security;
alter table public.payments enable row level security;

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

create policy "Gym members can read members"
  on public.members for select
  to authenticated
  using (
    gym_id in (select gym_id from public.profiles where user_id = auth.uid())
  );

create policy "Managers can insert members"
  on public.members for insert
  to authenticated
  with check (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Managers can update members"
  on public.members for update
  to authenticated
  using (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  )
  with check (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Managers can delete members"
  on public.members for delete
  to authenticated
  using (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Gym members can read staff"
  on public.staff for select
  to authenticated
  using (
    gym_id in (select gym_id from public.profiles where user_id = auth.uid())
  );

create policy "Managers can insert staff"
  on public.staff for insert
  to authenticated
  with check (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Managers can update staff"
  on public.staff for update
  to authenticated
  using (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  )
  with check (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Managers can delete staff"
  on public.staff for delete
  to authenticated
  using (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Gym members can read classes"
  on public.classes for select
  to authenticated
  using (
    gym_id in (select gym_id from public.profiles where user_id = auth.uid())
  );

create policy "Managers can insert classes"
  on public.classes for insert
  to authenticated
  with check (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Managers can update classes"
  on public.classes for update
  to authenticated
  using (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  )
  with check (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Managers can delete classes"
  on public.classes for delete
  to authenticated
  using (
    gym_id in (
      select gym_id from public.profiles
      where user_id = auth.uid() and role in ('owner', 'manager')
    )
  );

create policy "Gym members can read class sessions"
  on public.class_sessions for select
  to authenticated
  using (
    class_id in (
      select id from public.classes
      where gym_id in (select gym_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Managers can insert class sessions"
  on public.class_sessions for insert
  to authenticated
  with check (
    class_id in (
      select id from public.classes
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  );

create policy "Managers can update class sessions"
  on public.class_sessions for update
  to authenticated
  using (
    class_id in (
      select id from public.classes
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  )
  with check (
    class_id in (
      select id from public.classes
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  );

create policy "Managers can delete class sessions"
  on public.class_sessions for delete
  to authenticated
  using (
    class_id in (
      select id from public.classes
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  );

create policy "Gym members can read payments"
  on public.payments for select
  to authenticated
  using (
    member_id in (
      select id from public.members
      where gym_id in (select gym_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Managers can insert payments"
  on public.payments for insert
  to authenticated
  with check (
    member_id in (
      select id from public.members
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  );

create policy "Managers can update payments"
  on public.payments for update
  to authenticated
  using (
    member_id in (
      select id from public.members
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  )
  with check (
    member_id in (
      select id from public.members
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  );

create policy "Managers can delete payments"
  on public.payments for delete
  to authenticated
  using (
    member_id in (
      select id from public.members
      where gym_id in (
        select gym_id from public.profiles
        where user_id = auth.uid() and role in ('owner', 'manager')
      )
    )
  );
