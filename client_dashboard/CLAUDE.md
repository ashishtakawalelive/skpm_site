# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test framework is configured.

Environment variables required (copy `.env.example` → `.env`):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**SKPM Client Dashboard** is a React + Vite SPA — a role-based Kanban board for managing client projects and attendance. Backend is entirely Supabase (PostgreSQL + Auth).

### Roles

| Role | Capabilities |
|------|-------------|
| `skpm_admin` | Full access: clients, users, columns, cards |
| `skpm_staff` | Board management (columns, cards); no user/client creation |
| `client` | View and edit only their assigned client's board; locked columns are read-only |

Role and `client_id` live on `public.users` (extends `auth.users`). All tables have Row-Level Security enforced via `get_user_role()` and `get_user_client_id()` helper functions.

### Key layers

- **`src/contexts/AuthContext.jsx`** — session management, user profile, role helpers (`isAdmin`, `isStaff`). All auth state flows from here.
- **`src/contexts/ClientContext.jsx`** — client CRUD and the active client selection used across the app.
- **`src/hooks/useBoard.js`** — all board state: fetches columns, cards, and templates for the selected client; handles drag-and-drop reorder, card CRUD, column CRUD, and optimistic updates with rollback.
- **`src/pages/Dashboard.jsx`** — orchestrates DnD (via `@dnd-kit`) and renders the board using `KanbanColumn` / `KanbanCard`.
- **`src/lib/supabase.js`** — single Supabase client instance; import from here everywhere.

### Database tables

| Table | Purpose |
|-------|---------|
| `public.users` | Profiles: name, email, role, client_id |
| `public.clients` | Client orgs; `attendance_enabled`, `task_chart_enabled` flags |
| `public.columns` | Kanban columns per client; `position`, `is_locked` |
| `public.cards` | Cards with JSONB `data` field, `status`, `position`, `template_id` |
| `public.card_templates` | Reusable field schemas per column (JSONB `fields`) |
| `public.visits` | Attendance log; `month`/`year` bucketed per client |

Schema lives in `supabase/schema.sql`.

### Drag and drop

`@dnd-kit` handles two independent drag axes in `Dashboard.jsx`:
- Horizontal: column reordering (`SortableContext` with `horizontalListSortingStrategy`)
- Vertical: card reordering and cross-column moves (`SortableContext` with `verticalListSortingStrategy` per column)

The `useBoard` hook provides the state arrays and mutation functions that Dashboard feeds into DnD sensors and event handlers.

### Auto-status

When a card is moved to a column, `useBoard` inspects the column name via `includes()` against known keywords (`Completed`, `In Progress`, `Overdue`, etc.) and sets the card's `status` field automatically.

### Vite bundle splitting

`vite.config.js` defines manual chunks: `supabase`, `dnd`, and `vendor` — keep new heavy dependencies assigned to an appropriate chunk.

## Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `/index.html` for client-side routing. No CI/CD pipeline is configured.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin (no separate `tailwind.config.js` needed). Inter font loaded from Google Fonts in `index.html`. No component library — all UI is custom Tailwind.

## No TypeScript

The project is plain JSX. Do not introduce `.ts`/`.tsx` files without explicit agreement.
