# SKPM Client Dashboard — Full Project Document

> Last updated: 2 June 2026  
> Use this document to resume development in any AI tool. It covers every file, feature, database table, and architectural decision in the project.

---

## 1. Project Overview

A multi-client project management dashboard built for **SKPM** (an accounting/consulting firm). SKPM staff manage multiple client accounts. Each client gets a Kanban board, attendance tracking, and a task overview pie chart. Clients can log in and view their own board (read-only attendance and chart, limited card editing).

**Live deployment:** Vercel (auto-deploys from `main` branch on GitHub)  
**GitHub repo:** `https://github.com/Anishshelar/SKPM-dasdboard`  
**Backend:** Supabase (PostgreSQL + Auth + Edge Functions)

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19.x |
| Build tool | Vite | 8.x |
| Styling | Tailwind CSS (`@tailwindcss/vite` plugin) | 4.x |
| Routing | React Router DOM | 7.x |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | 6.x / 10.x / 3.x |
| Icons | lucide-react | 1.x |
| Database / Auth | Supabase JS client | 2.x |
| Data fetching | @tanstack/react-query (installed, not yet used) | 5.x |
| Font | Inter (Google Fonts, loaded in `index.html`) | — |
| Edge Functions runtime | Deno (Supabase hosted) | — |

---

## 3. Environment Variables

File: `.env` (never commit this file — it's in `.gitignore`)

```
VITE_SUPABASE_URL=https://yjjzahxvqexdzfnwqmvq.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

The Edge Function (`create-user`) uses `SUPABASE_SERVICE_ROLE_KEY`, which is **automatically injected by Supabase at runtime** — it is never stored in `.env` or exposed to the frontend.

---

## 4. Running Locally

```bash
npm install
npm run dev       # starts at http://localhost:5173
npm run build     # production build
```

---

## 5. Database Schema

### Table: `public.clients`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | auto-generated |
| `name` | text | client display name |
| `attendance_enabled` | boolean | default false — shows attendance card |
| `attendance_target` | integer | monthly visit target, default 20 |
| `task_chart_enabled` | boolean | default false — shows pie chart |
| `created_at` | timestamptz | auto |

### Table: `public.users`

Mirrors `auth.users`. Inserted by the `create-user` Edge Function.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | matches `auth.users.id` |
| `name` | text | display name |
| `email` | text | |
| `role` | text | `'skpm_admin'`, `'skpm_staff'`, or `'client'` |
| `client_id` | uuid (FK → clients) | only set for role `'client'` |

### Table: `public.columns`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `client_id` | uuid (FK → clients) | |
| `name` | text | column header |
| `position` | integer | display order, 0-indexed |
| `is_locked` | boolean | default false — clients cannot modify locked columns |

**Migration required if DB was created before `is_locked` was added:**
```sql
ALTER TABLE public.columns
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;
```

### Table: `public.cards`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `column_id` | uuid (FK → columns) | |
| `position` | integer | order within column, 0-indexed |
| `status` | text | `'default'`, `'in_progress'`, `'done'`, `'overdue'` |
| `data` | jsonb | all card content — see JSONB schema below |

#### Card `data` JSONB Schema

```json
{
  "type": "task" | "note",
  "title": "string",
  "content": "string (note type only)",
  "has_assignee": true | false,
  "assignee": "string",
  "has_status": true | false,
  "due_date": "YYYY-MM-DD string or empty string"
}
```

### Table: `public.card_templates`

Stores reusable field schemas per column (created via TemplateEditor).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `column_id` | uuid (FK → columns) | |
| `name` | text | template name |
| `fields` | jsonb | array of field definitions |

#### Template `fields` JSONB Schema

```json
[
  {
    "id": "uuid",
    "label": "Field Name",
    "type": "text" | "number" | "date" | "dropdown",
    "options": ["Option A", "Option B"]
  }
]
```

### Table: `public.visits`

Attendance log entries.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `client_id` | uuid (FK → clients) | |
| `visited_by` | text | name of SKPM staff who visited |
| `location` | text | where visit happened |
| `note` | text | optional note |
| `visited_at` | timestamptz | timestamp of visit |
| `month` | integer | 1–12 |
| `year` | integer | e.g. 2026 |

---

## 6. Supabase Edge Function: `create-user`

**Path:** `supabase/functions/create-user/index.ts`  
**Runtime:** Deno  
**Purpose:** Creates a new auth user + inserts into `public.users`. Uses `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to client).

**Endpoint:** `POST {SUPABASE_URL}/functions/v1/create-user`

**Request body:**
```json
{
  "name": "John Sharma",
  "email": "john@example.com",
  "password": "password123",
  "role": "client" | "skpm_staff" | "skpm_admin",
  "client_id": "uuid or null"
}
```

**Authorization:** Requires caller's JWT in `Authorization: Bearer <token>` header. Function verifies caller has role `skpm_admin`.

**Deploy command:**
```bash
supabase login
supabase link --project-ref yjjzahxvqexdzfnwqmvq
supabase functions deploy create-user
```

---

## 7. User Roles & Permissions

| Role | `isSKPM` | Access |
|---|---|---|
| `skpm_admin` | true | Everything: clients page, add/delete users, manage all boards, lock columns, log visits, all card actions |
| `skpm_staff` | true | Same as admin except cannot access `/clients` (admin-only route) |
| `client` | false | View their assigned client's board only; can add/move cards in unlocked columns; read-only attendance and pie chart |

**Computed role booleans in `AuthContext`:**
```js
const isAdmin = profile?.role === 'skpm_admin'
const isStaff = profile?.role === 'skpm_staff'
const isClient = profile?.role === 'client'
const isSKPM = isAdmin || isStaff
```

---

## 8. File Structure

```
src/
├── main.jsx                   — React entry point
├── App.jsx                    — Router setup, PrivateRoute, AppLayout
├── index.css                  — Global font (Inter), antialiasing
│
├── lib/
│   └── supabase.js            — Supabase client singleton
│
├── contexts/
│   ├── AuthContext.jsx        — Session, profile, role booleans, signIn/signOut
│   └── ClientContext.jsx      — Client list, selectedClientId, CRUD for clients
│
├── hooks/
│   └── useBoard.js            — All board data: columns, cards, templates; all CRUD + DnD helpers
│
├── pages/
│   ├── Login.jsx              — Gradient login page with forgot-password inline flow
│   ├── ResetPassword.jsx      — Password reset page (handles PASSWORD_RECOVERY auth event)
│   ├── Dashboard.jsx          — Main board page with DnD context, column + card logic
│   └── Clients.jsx            — Admin-only: client management + Add User + Manage Users
│
└── components/
    ├── Navbar.jsx             — Sticky top nav, client selector dropdown (SKPM only), logout
    ├── KanbanColumn.jsx       — Single column: header, lock toggle, drop zone, card list
    ├── KanbanCard.jsx         — Single card: drag handle, title, assignee, due date, status badge
    ├── CardModal.jsx          — Add/Edit card modal: type selector, toggles, due date picker, status picker
    ├── AttendanceCard.jsx     — Monthly visit tracker (Log Visit hidden from clients)
    ├── TaskPieChart.jsx       — SVG donut chart + legend (read-only, shown to all)
    ├── TemplateEditor.jsx     — Set up custom card fields per column (presets + custom builder)
    ├── CreateUserModal.jsx    — Admin modal to create new users via Edge Function
    └── ManageUsersModal.jsx   — Admin modal to list all users and send password reset emails
```

---

## 9. Routing

| Path | Component | Guard |
|---|---|---|
| `/login` | `Login` | Public (redirects to `/` if already logged in) |
| `/reset-password` | `ResetPassword` | Public |
| `/` | `Dashboard` | `PrivateRoute` |
| `/clients` | `Clients` | `PrivateRoute adminOnly` (skpm_admin only) |
| `/*` | redirect to `/` | — |

---

## 10. Feature Breakdown

### Kanban Board (`Dashboard.jsx` + `useBoard.js`)

- Columns fetched ordered by `position`; cards filtered to only those belonging to the current client's columns
- Drag-and-drop powered by `@dnd-kit`:
  - **Column reorder:** `useSortable` on column outer div, `horizontalListSortingStrategy`, `arrayMove` + bulk position update in DB
  - **Card move:** `useDroppable` (`id: 'drop-{columnId}'`) on inner card zone; `useSortable` on each card
  - `over.data?.current?.columnId` is the authoritative way to get target column — it's set on both the column sortable and inner droppable data
- **Auto-status on card move:** When a card with `has_status: true` is moved, its status auto-updates based on column name matching:
  - `name.includes('to do')` or `'todo'` → `'default'`
  - `name.includes('in progress')` or `'inprogress'` → `'in_progress'`
  - `name.includes('done')` or `'completed'` or `'complete'` or `'finished'` → `'done'`
- **Column locking (SKPM only):** Column menu → Lock/Unlock. Locked columns:
  - Show a lock icon in the header (visible to all)
  - Clients: card dragging disabled (`useSortable disabled` prop), Add Card button hidden, drop zone suppresses hover highlight
  - SKPM users: unaffected, can still do everything

### Card Fields

Every card has a `data` JSONB. The `CardModal` exposes:
- **Type:** Task or Note
- **Title:** always required
- **Content:** only for Note type
- **Assignee toggle:** shows assignee name input
- **Due date:** date picker (task only); blank = not shown on card
- **Status toggle:** shows status button picker (To Do / In Progress / Done)

Due date display on card:
- Gray: future date (> 3 days away)
- Amber: due within 3 days
- Red background: overdue (past today)

### Attendance Tracking

- Per-client, per-month visits stored in `visits` table
- `AttendanceCard` shows current month's visits, progress bar, last visit info
- "Log Visit" button only visible to SKPM users (`isSKPM` prop)
- Clients can view but not add visits

### Task Pie Chart

- SVG donut chart (no external chart library)
- Counts only cards with `data.has_status: true`
- Three slices: To Do (`#3b82f6`), In Progress (`#f59e0b`), Done (`#22c55e`)
- Fully read-only, no props needed beyond `cards` array

### Authentication

- Email/password via Supabase Auth
- **Forgot password (self-service):** On login page, inline flow sends reset email via `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- **Admin reset password:** In Manage Users modal, "Reset Password" button sends reset link to any user's email
- **Reset password page:** Listens for `PASSWORD_RECOVERY` auth event, shows form, calls `supabase.auth.updateUser({ password })`, then signs out and redirects to `/login`
- **Supabase Dashboard required config:** In Authentication → URL Configuration, add your Vercel URL + `/reset-password` to allowed redirect URLs

### User Management (Admin only)

- **Add User:** `CreateUserModal` calls the `create-user` Edge Function
- **Manage Users:** `ManageUsersModal` lists all users from `public.users`, shows role badge + client name, allows sending password reset emails

### Client Management (Admin only, `/clients` page)

- Create, edit, delete clients
- Per-client flags: `attendance_enabled`, `attendance_target`, `task_chart_enabled`
- "View Dashboard" link navigates to `/` with that client selected
- "Add User" → CreateUserModal
- "Manage Users" → ManageUsersModal

### Template Editor

- SKPM users can define custom card field schemas per column (via column menu → "Set Up Card Fields")
- 4 presets: Task, Invoice, Follow-up, Document
- 4 field types: Text, Number, Date, Choices (dropdown)
- Saved to `card_templates` table
- Note: templates define the field schema but the actual card data editor (`CardModal`) uses its own fixed fields. Templates are stored but their rendering in `CardModal` is not yet fully implemented.

---

## 11. Design System

| Token | Value |
|---|---|
| Primary blue | `#2563eb` |
| Navy (dark) | `#1e3a5f` |
| Column header bg | `#eff6ff` |
| Background | `#f8fafc` (slate-50) |
| Font | Inter (400/500/600/700/800) via Google Fonts |
| Card shadow | `0 2px 8px rgba(0,0,0,0.07)` |
| Card hover shadow | `hover:shadow-md hover:-translate-y-0.5` |
| Border radius (cards) | `rounded-xl` (12px) |
| Border radius (modals) | `rounded-2xl` (16px) |
| Column width | `w-[300px]` (300px fixed) |

**Status colors:**

| Status | Border | Badge bg | Badge text |
|---|---|---|---|
| To Do (default) | `#2563eb` | `#eff6ff` | `#2563eb` |
| In Progress | `#f59e0b` | `#fffbeb` | `#d97706` |
| Done | `#10b981` | `#ecfdf5` | `#059669` |
| Overdue | `#ef4444` | `#fef2f2` | `#dc2626` |

**Login / Reset Password background:**
```css
linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)
```

---

## 12. Key Architectural Patterns

### `useBoard.js` hook

Single hook handles all board state. Called once in `Dashboard.jsx` with `selectedClientId`. Returns: `columns`, `cards`, `templates`, `loading`, and all mutation functions.

Optimistic updates pattern used throughout:
```js
// 1. Update local state immediately
setCards(prev => prev.map(...))
// 2. Persist to DB
const { error } = await supabase.from('cards').update(...)
// 3. On error, refetch to rollback
if (error) fetchBoard()
```

### ClientContext for client users

Client users don't load the full client list — they call `fetchClientById(profile.client_id)` which fetches just their one record and stores it in `clients` state. `selectedClient` then resolves from that single-item array. This is why `selectedClient` is populated for clients even though they never see the dropdown.

### DnD-kit two-hook pattern in KanbanColumn

Both `useSortable` (for column reordering) and `useDroppable` (for card drops) are used on the same column component with **different IDs**:
- `useSortable({ id: column.id, data: { type: 'column', columnId: column.id } })` — on outer div
- `useDroppable({ id: 'drop-{column.id}', data: { type: 'column-drop', columnId: column.id } })` — on inner card zone

Both put `columnId` in `data` so `over.data?.current?.columnId` always resolves correctly in `handleDragEnd` regardless of which zone is the drop target.

### Column locking enforcement (two layers)

1. **Prevent drag start:** `useSortable({ disabled: isLocked && !isSKPM })` in `KanbanCard` — disabled cards cannot be picked up
2. **Prevent drop:** Guards in `Dashboard.handleDragEnd` — `if (!isSKPM && fromColumn?.is_locked) return` and `if (!isSKPM && targetColumn?.is_locked) return`

---

## 13. Component Props Reference

### `KanbanColumn`
```
column          — column object (id, name, position, is_locked, client_id)
cards           — array of card objects for this column
isSKPM          — boolean
onAddCard(col)  — open CardModal for new card in this column
onEditCard(card)
onDeleteCard(cardId)
onDeleteColumn(colId)
onRenameColumn(colId, newName)
onToggleLock(colId, locked)
```

### `KanbanCard`
```
card            — card object (id, column_id, status, data, position)
onEdit(card)
onDelete(cardId)
isSKPM          — boolean
isLocked        — boolean (column's is_locked value)
```

### `CardModal`
```
card            — existing card object or null (null = create mode)
columnName      — string, shown in modal header
onSave({ data, status })
onClose()
```

### `AttendanceCard`
```
client          — client object (id, name, attendance_target, ...)
isSKPM          — boolean (hides Log Visit button when false)
```

### `TaskPieChart`
```
cards           — all cards array (filtered internally to has_status: true)
```

### `TemplateEditor`
```
column          — column object
template        — existing template object or null
onSave(columnId, name, fields, existingId)
onClose()
```

### `CreateUserModal`
```
onClose()
clients         — array of all client objects (for the client assignment dropdown)
```

### `ManageUsersModal`
```
onClose()
clients         — array of all client objects (for resolving client names)
```

---

## 14. Pending / Incomplete Items

1. **Deploy Edge Function** — If `create-user` Edge Function hasn't been deployed yet:
   ```bash
   supabase functions deploy create-user
   ```
   Until deployed, "Add User" will show: `"Server error (HTTP 404). The Edge Function may not be deployed."`

2. **Supabase redirect URL** — Add `https://<vercel-url>/reset-password` to Supabase Dashboard → Authentication → URL Configuration → Allowed Redirect URLs. Without this, password reset emails will be blocked.

3. **`is_locked` column migration** — If the DB predates the lock feature, run:
   ```sql
   ALTER TABLE public.columns
     ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;
   ```

4. **Template-driven card creation** — `card_templates` are stored and editable via `TemplateEditor`, but `CardModal` currently uses its own fixed field set (title, assignee, due date, status). Templates do not yet drive the CardModal's form fields. This is the next logical feature to implement.

5. **RLS (Row Level Security)** — Supabase RLS policies were not reviewed/implemented in this project. Currently relying on frontend role checks. For production, RLS policies should be added to ensure clients can only read/write their own data.

6. **`@tanstack/react-query`** — Installed as a dependency but not yet used. The project uses manual `useState` + `useEffect` fetch patterns in `useBoard.js`.

---

## 15. Git History (recent)

```
bc07d8e  Show attendance and pie chart to clients (read-only)
68a3195  Add column locking and due date field
0eb3b8a  Simplify UI: presets in template editor, card modal sheet, cleaner column menu, Add Column modal
3576c35  initial commit
```

---

## 16. Common Gotchas

- **`over.id` vs `over.data?.current?.columnId`** — When a card is dragged over a column, `over.id` may be `'drop-{columnId}'` (inner droppable ID) or a card's own UUID. Always use `over.data?.current?.columnId` as the primary way to resolve the target column.

- **Auto-status uses `.includes()` not exact match** — Column name matching uses `name.includes('done')` etc., not `name === 'done'`. This correctly handles names like "Completed SKPM" or "In Progress Tasks".

- **Client users have empty `clients` array by default** — `fetchClients()` is only called for SKPM users. For clients, `fetchClientById(profile.client_id)` is called instead, populating `clients` with a single-element array.

- **`updateColumn` only updates state on success** — If a DB update fails (e.g., column doesn't exist), state is NOT updated. This means lock toggle silently fails if `is_locked` column doesn't exist in DB.

- **Date timezone handling** — Due dates are stored as `YYYY-MM-DD` strings. When comparing with `new Date()`, use `new Date(dueDate + 'T12:00:00')` to avoid timezone-off-by-one issues.

- **Write tool requires prior Read** — When editing files with this AI assistant, the Read tool must be called before Write/Edit can be used on the same file.
