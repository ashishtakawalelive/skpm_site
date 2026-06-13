-- ============================================================
-- SKPM Client Dashboard - FULL Supabase Schema (consolidated)
-- Run this entire file in the Supabase SQL Editor on a fresh project.
-- Idempotent: safe to re-run.
--
-- Includes:
--   * base schema.sql
--   * columns.is_locked (was a manual ALTER on the old DB)
--   * card_comments RLS + policies (was add_card_comments.sql)
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
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Safety net: ensure is_locked exists even if columns was created from the old schema
alter table public.columns add column if not exists is_locked boolean not null default false;

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
-- ROW LEVEL SECURITY (enable on every table)
-- ============================================================

alter table public.clients enable row level security;
alter table public.users enable row level security;
alter table public.columns enable row level security;
alter table public.card_templates enable row level security;
alter table public.cards enable row level security;
alter table public.card_comments enable row level security;
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

drop policy if exists "skpm can view all clients" on public.clients;
create policy "skpm can view all clients"
  on public.clients for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "client can view own client" on public.clients;
create policy "client can view own client"
  on public.clients for select
  using (
    get_user_role() = 'client'
    and id = get_user_client_id()
  );

drop policy if exists "admin can insert clients" on public.clients;
create policy "admin can insert clients"
  on public.clients for insert
  with check (get_user_role() = 'skpm_admin');

drop policy if exists "admin can update clients" on public.clients;
create policy "admin can update clients"
  on public.clients for update
  using (get_user_role() = 'skpm_admin');

drop policy if exists "admin can delete clients" on public.clients;
create policy "admin can delete clients"
  on public.clients for delete
  using (get_user_role() = 'skpm_admin');

-- ============================================================
-- USERS POLICIES
-- ============================================================

drop policy if exists "skpm can view all users" on public.users;
create policy "skpm can view all users"
  on public.users for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "users can view own record" on public.users;
create policy "users can view own record"
  on public.users for select
  using (id = auth.uid());

drop policy if exists "admin can insert users" on public.users;
create policy "admin can insert users"
  on public.users for insert
  with check (get_user_role() = 'skpm_admin');

drop policy if exists "admin can update users" on public.users;
create policy "admin can update users"
  on public.users for update
  using (get_user_role() = 'skpm_admin');

drop policy if exists "admin can delete users" on public.users;
create policy "admin can delete users"
  on public.users for delete
  using (get_user_role() = 'skpm_admin');

-- ============================================================
-- COLUMNS POLICIES
-- ============================================================

drop policy if exists "skpm can view all columns" on public.columns;
create policy "skpm can view all columns"
  on public.columns for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "client can view own columns" on public.columns;
create policy "client can view own columns"
  on public.columns for select
  using (
    get_user_role() = 'client'
    and client_id = get_user_client_id()
  );

drop policy if exists "skpm can insert columns" on public.columns;
create policy "skpm can insert columns"
  on public.columns for insert
  with check (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "skpm can update columns" on public.columns;
create policy "skpm can update columns"
  on public.columns for update
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "skpm can delete columns" on public.columns;
create policy "skpm can delete columns"
  on public.columns for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- CARD TEMPLATES POLICIES
-- ============================================================

drop policy if exists "skpm can view all templates" on public.card_templates;
create policy "skpm can view all templates"
  on public.card_templates for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "client can view own templates" on public.card_templates;
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

drop policy if exists "skpm can insert templates" on public.card_templates;
create policy "skpm can insert templates"
  on public.card_templates for insert
  with check (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "skpm can update templates" on public.card_templates;
create policy "skpm can update templates"
  on public.card_templates for update
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "skpm can delete templates" on public.card_templates;
create policy "skpm can delete templates"
  on public.card_templates for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- CARDS POLICIES
-- ============================================================

drop policy if exists "skpm can view all cards" on public.cards;
create policy "skpm can view all cards"
  on public.cards for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "client can view own cards" on public.cards;
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

drop policy if exists "anyone can insert cards" on public.cards;
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

drop policy if exists "anyone can update cards" on public.cards;
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

drop policy if exists "skpm can delete cards" on public.cards;
create policy "skpm can delete cards"
  on public.cards for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- CARD COMMENTS POLICIES
-- ============================================================

drop policy if exists "skpm can view all comments" on public.card_comments;
create policy "skpm can view all comments"
  on public.card_comments for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "client can view comments on own cards" on public.card_comments;
create policy "client can view comments on own cards"
  on public.card_comments for select
  using (
    get_user_role() = 'client'
    and exists (
      select 1 from public.cards
      join public.columns on columns.id = cards.column_id
      where cards.id = card_comments.card_id
      and columns.client_id = get_user_client_id()
    )
  );

drop policy if exists "authenticated can insert own comments" on public.card_comments;
create policy "authenticated can insert own comments"
  on public.card_comments for insert
  with check (
    auth.uid() = user_id
    and (
      get_user_role() in ('skpm_admin', 'skpm_staff')
      or (
        get_user_role() = 'client'
        and exists (
          select 1 from public.cards
          join public.columns on columns.id = cards.column_id
          where cards.id = card_id
          and columns.client_id = get_user_client_id()
        )
      )
    )
  );

drop policy if exists "skpm can delete any comment" on public.card_comments;
create policy "skpm can delete any comment"
  on public.card_comments for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "users can delete own comments" on public.card_comments;
create policy "users can delete own comments"
  on public.card_comments for delete
  using (user_id = auth.uid());

-- ============================================================
-- VISITS POLICIES
-- ============================================================

drop policy if exists "skpm can view all visits" on public.visits;
create policy "skpm can view all visits"
  on public.visits for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

drop policy if exists "client can view own visits" on public.visits;
create policy "client can view own visits"
  on public.visits for select
  using (
    get_user_role() = 'client'
    and client_id = get_user_client_id()
  );

drop policy if exists "anyone can insert visits" on public.visits;
create policy "anyone can insert visits"
  on public.visits for insert
  with check (
    get_user_role() in ('skpm_admin', 'skpm_staff')
    or (
      get_user_role() = 'client'
      and client_id = get_user_client_id()
    )
  );

drop policy if exists "skpm can delete visits" on public.visits;
create policy "skpm can delete visits"
  on public.visits for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists columns_client_id_idx on public.columns(client_id);
create index if not exists cards_column_id_idx on public.cards(column_id);
create index if not exists card_templates_column_id_idx on public.card_templates(column_id);
create index if not exists card_comments_card_id_idx on public.card_comments(card_id);
create index if not exists card_comments_user_id_idx on public.card_comments(user_id);
create index if not exists visits_client_id_idx on public.visits(client_id);
create index if not exists visits_month_year_idx on public.visits(client_id, month, year);
create index if not exists users_client_id_idx on public.users(client_id);
