-- ==============================================================================
-- BrokeNoMore Schema: Admin Role-Based Access Control (RBAC) & Audit Logging
-- Version: 2.0
-- Enforces: "A hidden button is not authorization."
-- Roles: support_agent, content_manager, moderator, analyst, super_admin
-- ==============================================================================

-- 1. Staff Roles Table
create table if not exists public.staff_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('support_agent', 'content_manager', 'moderator', 'analyst', 'super_admin')),
  granted_by uuid references auth.users on delete set null,
  created_at timestamptz default now() not null,
  unique (user_id, role)
);

-- 2. Staff Action Audit Log
create table if not exists public.staff_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_id uuid references auth.users on delete set null not null,
  role text not null,
  action text not null,
  target_resource text not null,
  target_id text,
  reason text not null,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

-- 3. Attention Queue (System Incidents, Flagged Content, Sync Issues)
create table if not exists public.attention_queue (
  id uuid default uuid_generate_v4() primary key,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  category text not null check (category in ('incident', 'moderation', 'config_warning', 'experiment_anomaly')),
  title text not null,
  description text not null,
  status text default 'pending' not null check (status in ('pending', 'investigating', 'resolved', 'dismissed')),
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  resolved_at timestamptz,
  resolved_by uuid references auth.users on delete set null
);

-- 4. Helper Security Definer Functions
create or replace function public.is_staff(check_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.staff_roles
    where user_id = check_user_id
  );
end;
$$ language plpgsql security definer;

create or replace function public.has_staff_role(check_user_id uuid, required_role text)
returns boolean as $$
begin
  return exists (
    select 1 from public.staff_roles
    where user_id = check_user_id and (role = required_role or role = 'super_admin')
  );
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- Row Level Security (RLS) Policies for Admin Tables
-- ==============================================================================

alter table public.staff_roles enable row level security;
alter table public.staff_audit_logs enable row level security;
alter table public.attention_queue enable row level security;

-- staff_roles: Only super_admin can view or grant staff roles
create policy "Super admins can manage staff roles" on public.staff_roles
  for all using (public.has_staff_role(auth.uid(), 'super_admin'))
  with check (public.has_staff_role(auth.uid(), 'super_admin'));

create policy "Staff can view their own role" on public.staff_roles
  for select using (auth.uid() = user_id);

-- staff_audit_logs: All staff can insert logs; only super_admin and analyst can view
create policy "Staff can log actions" on public.staff_audit_logs
  for insert with check (public.is_staff(auth.uid()) and auth.uid() = actor_id);

create policy "Authorized staff can view audit logs" on public.staff_audit_logs
  for select using (
    public.has_staff_role(auth.uid(), 'super_admin') or
    public.has_staff_role(auth.uid(), 'analyst')
  );

-- attention_queue: Any staff member can view and update attention queue items
create policy "Staff can view attention queue" on public.attention_queue
  for select using (public.is_staff(auth.uid()));

create policy "Staff can update attention queue" on public.attention_queue
  for update using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create policy "Staff can insert attention queue items" on public.attention_queue
  for insert with check (public.is_staff(auth.uid()));
