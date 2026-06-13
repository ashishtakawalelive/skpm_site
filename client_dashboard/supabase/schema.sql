-- ============================================================
-- SKPM Client Dashboard - Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Clients table
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  attendance_enabled boolean not null default false,
  attendance_target integer not null default 20,
  task_chart_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('skpm_admin', 'skpm_staff', 'client')),
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Columns table
create table if not exists public.columns (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Card templates table
create table if not exists public.card_templates (
  id uuid primary key default uuid_generate_v4(),
  column_id uuid not null references public.columns(id) on delete cascade,
  name text not null default 'Card',
  fields jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Cards table
create table if not exists public.cards (
  id uuid primary key default uuid_generate_v4(),
  column_id uuid not null references public.columns(id) on delete cascade,
  template_id uuid references public.card_templates(id) on delete set null,
  data jsonb not null default '{}',
  position integer not null default 0,
  status text not null default 'default' check (status in ('default', 'in_progress', 'done', 'overdue')),
  month integer not null default 6,
  year integer not null default 2026,
  created_at timestamptz not null default now()
);

-- Card comments table
create table if not exists public.card_comments (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Visits table (attendance)
create table if not exists public.visits (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  visited_by text not null,
  location text not null,
  note text,
  visited_at timestamptz not null default now(),
  month integer not null,
  year integer not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.clients enable row level security;
alter table public.users enable row level security;
alter table public.columns enable row level security;
alter table public.card_templates enable row level security;
alter table public.cards enable row level security;
alter table public.visits enable row level security;

-- Helper function to get current user's role
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.users where id = auth.uid();
$$;

-- Helper function to get current user's client_id
create or replace function public.get_user_client_id()
returns uuid
language sql
stable
security definer
as $$
  select client_id from public.users where id = auth.uid();
$$;

-- ============================================================
-- CLIENTS POLICIES
-- ============================================================

-- SKPM staff/admin can see all clients
create policy "skpm can view all clients"
  on public.clients for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Client users can only see their own client
create policy "client can view own client"
  on public.clients for select
  using (
    get_user_role() = 'client'
    and id = get_user_client_id()
  );

-- Only admins can insert clients
create policy "admin can insert clients"
  on public.clients for insert
  with check (get_user_role() = 'skpm_admin');

-- Only admins can update clients
create policy "admin can update clients"
  on public.clients for update
  using (get_user_role() = 'skpm_admin');

-- Only admins can delete clients
create policy "admin can delete clients"
  on public.clients for delete
  using (get_user_role() = 'skpm_admin');

-- ============================================================
-- USERS POLICIES
-- ============================================================

-- SKPM can see all users
create policy "skpm can view all users"
  on public.users for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Users can view their own record
create policy "users can view own record"
  on public.users for select
  using (id = auth.uid());

-- Only admins can insert users
create policy "admin can insert users"
  on public.users for insert
  with check (get_user_role() = 'skpm_admin');

-- Only admins can update users
create policy "admin can update users"
  on public.users for update
  using (get_user_role() = 'skpm_admin');

-- Only admins can delete users
create policy "admin can delete users"
  on public.users for delete
  using (get_user_role() = 'skpm_admin');

-- ============================================================
-- COLUMNS POLICIES
-- ============================================================

-- SKPM can see all columns
create policy "skpm can view all columns"
  on public.columns for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Client can see their own columns
create policy "client can view own columns"
  on public.columns for select
  using (
    get_user_role() = 'client'
    and client_id = get_user_client_id()
  );

-- Only admins and staff can insert columns
create policy "skpm can insert columns"
  on public.columns for insert
  with check (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Only admins and staff can update columns
create policy "skpm can update columns"
  on public.columns for update
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Only admins and staff can delete columns
create policy "skpm can delete columns"
  on public.columns for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- CARD TEMPLATES POLICIES
-- ============================================================

-- SKPM can see all templates
create policy "skpm can view all templates"
  on public.card_templates for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Client can see templates for their columns
create policy "client can view own templates"
  on public.card_templates for select
  using (
    get_user_role() = 'client'
    and exists (
      select 1 from public.columns
      where columns.id = card_templates.column_id
      and columns.client_id = get_user_client_id()
    )
  );

-- Only SKPM can insert/update/delete templates
create policy "skpm can insert templates"
  on public.card_templates for insert
  with check (get_user_role() in ('skpm_admin', 'skpm_staff'));

create policy "skpm can update templates"
  on public.card_templates for update
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

create policy "skpm can delete templates"
  on public.card_templates for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- CARDS POLICIES
-- ============================================================

-- SKPM can see all cards
create policy "skpm can view all cards"
  on public.cards for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Client can see their own cards
create policy "client can view own cards"
  on public.cards for select
  using (
    get_user_role() = 'client'
    and exists (
      select 1 from public.columns
      where columns.id = cards.column_id
      and columns.client_id = get_user_client_id()
    )
  );

-- SKPM and clients can insert cards
create policy "anyone can insert cards"
  on public.cards for insert
  with check (
    get_user_role() in ('skpm_admin', 'skpm_staff')
    or (
      get_user_role() = 'client'
      and exists (
        select 1 from public.columns
        where columns.id = column_id
        and columns.client_id = get_user_client_id()
      )
    )
  );

-- SKPM and clients can update cards (move/edit)
create policy "anyone can update cards"
  on public.cards for update
  using (
    get_user_role() in ('skpm_admin', 'skpm_staff')
    or (
      get_user_role() = 'client'
      and exists (
        select 1 from public.columns
        where columns.id = cards.column_id
        and columns.client_id = get_user_client_id()
      )
    )
  );

-- Only SKPM can delete cards
create policy "skpm can delete cards"
  on public.cards for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- VISITS POLICIES
-- ============================================================

-- SKPM can see all visits
create policy "skpm can view all visits"
  on public.visits for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- Clients can see their own visits
create policy "client can view own visits"
  on public.visits for select
  using (
    get_user_role() = 'client'
    and client_id = get_user_client_id()
  );

-- Anyone can log a visit
create policy "anyone can insert visits"
  on public.visits for insert
  with check (
    get_user_role() in ('skpm_admin', 'skpm_staff')
    or (
      get_user_role() = 'client'
      and client_id = get_user_client_id()
    )
  );

-- Only SKPM can delete visits
create policy "skpm can delete visits"
  on public.visits for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- FUNCTION: Create a client user (called from admin UI via service role)
-- ============================================================

-- This function is called server-side or via Supabase Edge Function
-- to create auth users without exposing service role key to frontend.
-- For frontend-only setup: use Supabase Dashboard to create the first
-- skpm_admin user manually, then use the admin panel for subsequent users.

-- ============================================================
-- FUNCTION: Delete a user (auth login + profile)
-- ============================================================

-- Called from the admin UI: supabase.rpc('delete_user', { target_user_id }).
-- SECURITY DEFINER so it can remove the row from auth.users, which cascades
-- to public.users (FK on delete cascade). Guarded so only skpm_admin may run
-- it, and admins / the caller's own account cannot be deleted.
create or replace function public.delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role text;
  target_role text;
begin
  -- Only admins may delete users
  select role into caller_role from public.users where id = auth.uid();
  if caller_role is distinct from 'skpm_admin' then
    raise exception 'Only admins can delete users';
  end if;

  -- Cannot delete your own account
  if target_user_id = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;

  -- Cannot delete other admins
  select role into target_role from public.users where id = target_user_id;
  if target_role = 'skpm_admin' then
    raise exception 'Admin users cannot be deleted';
  end if;

  -- Remove the auth login; cascades to public.users via FK on delete cascade
  delete from auth.users where id = target_user_id;
end;
$$;

grant execute on function public.delete_user(uuid) to authenticated;

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists columns_client_id_idx on public.columns(client_id);
create index if not exists cards_column_id_idx on public.cards(column_id);
create index if not exists card_templates_column_id_idx on public.card_templates(column_id);
create index if not exists visits_client_id_idx on public.visits(client_id);
create index if not exists visits_month_year_idx on public.visits(client_id, month, year);
create index if not exists users_client_id_idx on public.users(client_id);
