-- ============================================================
-- Migration: Add cards.completed_at
-- Run this in the Supabase SQL Editor
-- ============================================================
--
-- The board records WHEN a card entered the "Done" status (and clears it when
-- a card leaves Done) so it can flag late completions / "days late" on the
-- cards, summary cards, pie chart, and PDF export.
--
-- moveCard() (src/hooks/useBoard.js) writes `completed_at` on every
-- status-changing move. Without this column, PostgREST rejects the UPDATE
-- ("Could not find the 'completed_at' column of 'cards' in the schema cache"),
-- the optimistic move is rolled back via a full refetch, and the dragged card
-- snaps back to its original column — i.e. drag-and-drop appears broken.
--
-- Idempotent: safe to re-run.

alter table public.cards add column if not exists completed_at timestamptz;
