-- ============================================================
-- Migration: Add card_comments table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.card_comments (
  id uuid primary key default uuid_generate_v4(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.card_comments enable row level security;

create index if not exists card_comments_card_id_idx on public.card_comments(card_id);
create index if not exists card_comments_user_id_idx on public.card_comments(user_id);

-- SELECT: SKPM sees all; clients see comments on their client's cards
create policy "skpm can view all comments"
  on public.card_comments for select
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

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

-- INSERT: any authenticated user can post their own comment on cards they can access
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

-- DELETE: SKPM can delete any; users can delete their own
create policy "skpm can delete any comment"
  on public.card_comments for delete
  using (get_user_role() in ('skpm_admin', 'skpm_staff'));

create policy "users can delete own comments"
  on public.card_comments for delete
  using (user_id = auth.uid());
