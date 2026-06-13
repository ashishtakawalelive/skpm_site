# SUPABASE BACKEND GUIDE
## SKPM Client Dashboard — How the Backend Works, Why We Use It, and How New Features Affect It

---

## 1. What Is Supabase and Why Did We Choose It?

### What Supabase Is

Supabase is an open-source "Backend as a Service" (BaaS) built on top of PostgreSQL. It gives you a full backend stack — database, authentication, file storage, and serverless functions — without you writing or deploying a backend server.

Think of it this way:
- Without Supabase → you'd need to build a Node.js/Express API, connect it to PostgreSQL, write auth middleware, deploy it to a VPS, manage SSL, handle token refresh, write CRUD endpoints for every table...
- With Supabase → all of that exists on day one. You call `supabase.from('cards').insert(...)` directly from the frontend.

### Why Supabase Specifically (and Not the Alternatives)

| Alternative | Why It Didn't Fit |
|-------------|------------------|
| **Firebase** | Uses NoSQL (Firestore). Your data is deeply relational — cards belong to columns, columns belong to clients, visits belong to clients. SQL is the natural fit. NoSQL would make queries like "get all cards for this client sorted by position" painful. |
| **PlanetScale / Neon** | Just a hosted database. Still need to build your own API, auth, and storage layer separately. |
| **Custom Node + PostgreSQL** | Full backend to write, maintain, and deploy separately. Adds weeks of setup and ongoing DevOps work. |
| **AWS Amplify** | Extremely complex setup and configuration. Overkill for a team dashboard. |
| **Supabase** | PostgreSQL (real SQL) + Auth + REST API auto-generated + Edge Functions + File Storage — all in one. Free tier is generous. Dashboard is simple. JS client library is excellent. |

### The Core Philosophy

> **Supabase exposes your PostgreSQL database directly to the frontend via a secure REST API.**

This means your React app talks directly to the database, with no custom backend in between. The security model works through:
1. **The anon key** — safe to expose in the frontend. It identifies your project but has limited permissions.
2. **Row Level Security (RLS) policies** — PostgreSQL rules that say "this user can only read rows where client_id = their client_id." (Not yet implemented in this project — currently relying on frontend role checks.)
3. **The service_role key** — elevated permissions, never exposed to the frontend. Only used inside Edge Functions (server-side).

---

## 2. The Four Supabase Services You're Using

### 2.1 — Auth (supabase.auth)

**What it does:** Manages every user session — signup, login, logout, token refresh, and password reset.

**How it works in this project:**

When a user logs in with email + password, Supabase Auth:
1. Verifies the credentials against its internal auth table (`auth.users` — separate from your public `users` table)
2. Returns a **JWT (JSON Web Token)** — a cryptographically signed string that proves who the user is
3. Stores it in `localStorage` automatically
4. Every subsequent Supabase call carries this token in the `Authorization` header — Supabase uses it to know which user is making the request

In `src/contexts/AuthContext.jsx`, this line listens to all auth changes:
```js
supabase.auth.onAuthStateChange((event, session) => { ... })
```
This fires on: login, logout, tab refresh (session restored from localStorage), token expiry and auto-refresh, and password recovery link click.

**Password reset flow:**
1. User clicks "Forgot Password" → `supabase.auth.resetPasswordForEmail(email)` is called
2. Supabase sends an email with a secure magic link
3. User clicks link → redirected to `/reset-password` in your app
4. The auth state change fires with event `PASSWORD_RECOVERY`
5. Your app calls `supabase.auth.updateUser({ password: newPassword })`

**What it does NOT touch:** Your `public.users` table. That's a separate table you maintain that stores extra info like `name`, `role` (admin/staff/client), and `client_id`. The auth system only knows email and password. Your app joins them by matching `auth.users.id` with `public.users.id`.

---

### 2.2 — Database (supabase.from)

**What it does:** Gives you a REST API over your PostgreSQL tables automatically. No SQL written in the frontend — just chained JavaScript methods.

**How PostgREST works under the hood:**

Supabase runs a layer called **PostgREST** between your frontend and the database. When you write:
```js
supabase.from('cards').select('*').eq('column_id', id).order('position')
```
PostgREST converts this into:
```sql
SELECT * FROM cards WHERE column_id = $1 ORDER BY position ASC;
```
...and sends the result back as JSON. You never write raw SQL from the frontend.

**Your 6 tables and what they store:**

| Table | What It Stores |
|-------|---------------|
| `clients` | Client companies — name, attendance settings, chart settings |
| `users` | Staff/admin/client accounts — name, email, role, which client they belong to |
| `columns` | Kanban columns — name, position, is_locked, which client they belong to |
| `cards` | Kanban cards — type, all field data in a JSONB blob, status, position, which column |
| `card_templates` | Saved card templates — name, description, fields config as JSONB |
| `visits` | Attendance log entries — who visited, where, when, notes |

**The JSONB pattern (why card data is stored as a blob):**

Cards have flexible fields — a "task" card has title, assignee, due_date, status; a "note" card has title and content. Instead of having 10 optional columns on the `cards` table (most of which would be NULL), all card-specific data is stored in one `data JSONB` column:
```json
{
  "type": "task",
  "title": "Submit GST return",
  "has_assignee": true,
  "assignee": "Rahul",
  "has_status": true,
  "due_date": "2026-06-15"
}
```
PostgreSQL's JSONB type is queryable and indexable — it's not just a text blob. The tradeoff: you can't enforce column-level constraints on JSONB fields, so validation is done in the frontend.

**Optimistic updates pattern used in this project:**

In `src/hooks/useBoard.js`, every write operation updates Supabase first, then updates local React state only on success:
```js
const { data, error } = await supabase.from('columns').update({ is_locked }).eq('id', id)
if (!error) setColumns(prev => prev.map(c => c.id === id ? data : c))
// if error — local state unchanged, UI stays as-is (silent fail)
```
This means if the DB operation fails (e.g., column doesn't exist yet), the UI won't incorrectly update. The downside is failures are currently silent — no toast or error shown to the user.

---

### 2.3 — Edge Functions (server-side Deno)

**What it does:** Runs JavaScript/TypeScript server-side, with access to the `service_role` key (elevated permissions).

**Why only one Edge Function exists (`create-user`):**

The Supabase JS client running in the browser uses the `anon` key — it can read/write data that RLS policies allow, but it **cannot create new auth users**. Creating a user requires the `service_role` key, which must never be in frontend code (it bypasses all security).

So when an SKPM admin adds a new staff member or client user in the Settings page:
1. Frontend calls the Edge Function: `supabase.functions.invoke('create-user', { body: { email, password, name, role, client_id } })`
2. Edge Function runs on Supabase's servers with the `service_role` key (auto-injected by Supabase — you never store it anywhere)
3. It calls `supabase.auth.admin.createUser(...)` — only possible with service_role
4. Also inserts a row into `public.users` with the name, role, and client_id
5. Returns success/error to the frontend

**Every other operation** (reading cards, moving cards, logging visits, updating columns) is done directly from the frontend with the anon key. Edge Functions are only needed when you need elevated permissions or server-side logic.

---

### 2.4 — Storage (supabase.storage) — NOT YET USED

**What it does:** Stores files (PDFs, images, documents) in S3-compatible buckets.

**Current status:** Not implemented in this project yet. If file uploads are added, this is what would be used.

**How it would work:** Files are uploaded to a named bucket, and the file path/URL is stored in the database (as a string in the card's `data` JSONB). The file itself never goes into PostgreSQL — only a pointer to it.

---

## 3. Current Database Usage and Limits

### Free Plan Limits

| Resource | Free Limit | Typical Row Size | Estimated Capacity |
|----------|-----------|------------------|--------------------|
| **Database** | 500 MB | Cards: ~1–2 KB | ~300,000 cards |
| **Storage** | 1 GB | — | Not in use yet |
| **Bandwidth** | 5 GB/month | — | Plenty for a small team |
| **Auth users** | 50,000 | — | Far more than needed |
| **Edge Function calls** | 500,000/month | — | Far more than needed |
| **DB connections** | 60 concurrent | — | Fine for a small team |

### Biggest Risk on Free Plan

**Auto-pause:** Supabase pauses free-tier projects after 1 week of inactivity. The project "wakes up" on the next request, but the first load takes 5–10 seconds. This is fine for development; for production with paying clients, upgrade to Pro ($25/month) to disable auto-pause.

### How to Check Current Usage Right Now

1. Go to supabase.com → sign in → open your project
2. **Settings → Billing** — shows DB size, bandwidth, storage used this month
3. **Settings → Database** — shows current database size directly

---

## 4. How New Features Affect the Database and Storage

This section covers every likely feature addition and exactly what it would require.

---

### Feature: PDF / File Attachments on Cards

**Impact: HIGH — introduces Supabase Storage for the first time**

**Database changes:**
- No new table needed
- Add `attachments` array to the card's `data` JSONB:
  ```json
  "attachments": [
    { "name": "Q1_Report.pdf", "path": "uploads/client-123/card-456/Q1_Report.pdf", "size": 1240000 }
  ]
  ```
- DB storage impact: negligible (just strings)

**Storage changes:**
- Create a bucket called `uploads` in Supabase dashboard
- Each uploaded file is stored at a path like `uploads/{client_id}/{card_id}/{filename}`
- Storage consumption: depends entirely on file sizes
  - 1 MB average PDF × 1,000 uploads = 1 GB (hits free limit)
  - For active clients uploading weekly → Pro plan needed within months

**Access control needed:**
- Storage bucket policies: SKPM users can upload/delete; clients can only read files belonging to their client_id
- This requires RLS on storage buckets (configured in Supabase dashboard)

**Code files to change:**
- `src/components/CardModal.jsx` — add file upload input
- `src/components/KanbanCard.jsx` — show attachment count/links
- `src/hooks/useBoard.js` — add `deleteCard` cleanup to also remove files from storage

---

### Feature: Comments / Activity Log on Cards

**Impact: MEDIUM — one new table**

**Database changes:**
- New table: `card_comments`
  ```sql
  CREATE TABLE card_comments (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id     uuid REFERENCES cards(id) ON DELETE CASCADE,
    author_name text NOT NULL,
    author_id   uuid REFERENCES users(id),
    body        text NOT NULL,
    created_at  timestamptz DEFAULT now()
  );
  ```
- Row size: ~200–400 bytes per comment
- 10,000 comments ≈ 4 MB — well within free tier

**Storage changes:** None

**Code files to change:**
- New component: `src/components/CardComments.jsx`
- `src/components/CardModal.jsx` — add comments section
- New hook or extend `useBoard.js` — fetch/add/delete comments

---

### Feature: Card Due Date Reminders / Notifications

**Impact: MEDIUM — requires either Edge Functions or a cron job**

**Database changes:** None (due_date already stored in card JSONB)

**Supabase changes:**
- New Edge Function: `send-reminders` — queries all cards where `due_date = tomorrow`, sends emails via a third-party service (Resend, SendGrid, etc.)
- Supabase **pg_cron** extension to schedule it daily (available on Pro plan only)
- Or: call the function from an external cron service (cron-job.org — free)

**Storage changes:** None

**Code files to change:**
- New Edge Function: `supabase/functions/send-reminders/index.ts`
- `supabase/functions/send-reminders/` — Deno runtime, calls Resend API

---

### Feature: Card Checklists (Sub-tasks)

**Impact: LOW — just expands the JSONB**

**Database changes:**
- No new table
- Add `checklist` array to card `data` JSONB:
  ```json
  "checklist": [
    { "id": "1", "text": "Review draft", "done": false },
    { "id": "2", "text": "Send to client", "done": true }
  ]
  ```
- Storage impact: minimal (~100 bytes per checklist item)

**Code files to change:**
- `src/components/CardModal.jsx` — add checklist builder
- `src/components/KanbanCard.jsx` — show checklist progress (e.g., "2/3 done")

---

### Feature: Multiple File Types (Images, Excel, Word)

**Impact: HIGH — same as PDFs but higher storage risk**

- Images (JPG/PNG): 500 KB–5 MB each — fills storage faster than PDFs
- Excel/Word: typically 50–500 KB — manageable
- Recommendation: add a **per-file size limit** (e.g., 10 MB max) and a **per-client storage quota** enforced in the upload function
- Pro plan almost certainly needed if images are allowed

---

### Feature: Real-time Card Updates (Multiple Users See Changes Live)

**Impact: LOW on storage, MEDIUM on setup**

**Database changes:** None

**Supabase changes:**
- Enable **Realtime** on the `cards` and `columns` tables in Supabase dashboard (toggle in Table Editor → Replication)
- In `src/hooks/useBoard.js`, add a Supabase Realtime subscription:
  ```js
  supabase
    .channel('cards-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, payload => {
      // update local state based on payload.eventType (INSERT/UPDATE/DELETE)
    })
    .subscribe()
  ```
- Realtime uses WebSockets — no extra storage, but counts against bandwidth (5 GB/month on free)

**Code files to change:**
- `src/hooks/useBoard.js` — add subscription, clean up on unmount

---

### Feature: Client Can Upload Their Own Logo / Profile Picture

**Impact: LOW — small files, Supabase Storage**

- Image sizes: 50–200 KB each
- 100 clients × 200 KB = 20 MB — negligible
- Store path in `clients.logo_url` (new text column)

**Database changes:**
```sql
ALTER TABLE clients ADD COLUMN logo_url text;
```

**Storage changes:**
- New bucket: `logos` (or subfolder in `uploads`)
- Very low storage consumption

---

### Feature: Card History / Audit Trail

**Impact: MEDIUM-HIGH — grows continuously**

**Database changes:**
- New table: `card_history`
  ```sql
  CREATE TABLE card_history (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id    uuid REFERENCES cards(id) ON DELETE CASCADE,
    changed_by text,
    field      text,   -- e.g. 'status', 'title', 'column'
    old_value  text,
    new_value  text,
    changed_at timestamptz DEFAULT now()
  );
  ```
- This table grows with every card edit — potentially thousands of rows per month
- Consider adding a **retention policy** (delete rows older than 90 days) to keep DB size controlled

**Storage changes:** None

---

### Feature: Multiple Kanban Boards Per Client

**Impact: LOW — one new column, minimal data**

**Database changes:**
- Add `board_id` column to `columns` table (or create a `boards` table)
  ```sql
  CREATE TABLE boards (
    id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    name      text NOT NULL,
    position  int DEFAULT 0
  );
  ALTER TABLE columns ADD COLUMN board_id uuid REFERENCES boards(id) ON DELETE CASCADE;
  ```
- Row size: negligible (boards are just names + metadata)

**Storage changes:** None

**Code files to change:**
- `src/hooks/useBoard.js` — filter by board_id
- `src/contexts/ClientContext.jsx` — add board selection state
- New component: board switcher in the toolbar

---

### Feature: Row Level Security (RLS) — Security Hardening

**Impact: ZERO on storage, HIGH importance for production**

Currently this project has **no RLS** — any authenticated user can technically query any row in any table from the browser console using the anon key. The only protection is frontend role checks. This is acceptable during development but should be fixed before handling sensitive client data.

**What RLS does:** PostgreSQL-level rules that run on every query. Example:
```sql
-- Clients can only see cards belonging to their own client
CREATE POLICY "clients_own_cards" ON cards
  FOR SELECT USING (
    column_id IN (
      SELECT id FROM columns WHERE client_id = (
        SELECT client_id FROM users WHERE id = auth.uid()
      )
    )
  );
```

**Database changes:** No new tables, no storage impact — just SQL policy statements run in Supabase SQL Editor

**Impact on code:** Minimal — queries stay the same. RLS is enforced invisibly at the DB level. The only change is that unauthorized queries return empty results instead of data.

---

## 5. Summary: Feature Impact Matrix

| Feature | New Table? | DB Size Impact | Storage Impact | Edge Function? | Plan Needed |
|---------|-----------|---------------|---------------|---------------|-------------|
| PDF uploads | No | Negligible | HIGH (1 GB free) | No | Pro if heavy use |
| Image uploads | No | Negligible | VERY HIGH | No | Pro recommended |
| Comments | Yes | Low | None | No | Free |
| Checklists | No | Negligible | None | No | Free |
| Real-time sync | No | None | Bandwidth cost | No | Free (monitor BW) |
| Due date reminders | No | None | None | Yes (new) | Free + cron |
| Audit trail | Yes | Medium-High | None | No | Free (add cleanup) |
| Multiple boards | Yes (1) | Negligible | None | No | Free |
| Client logo upload | No (1 column) | Negligible | Low | No | Free |
| RLS / Security | No | None | None | No | Free |

---

## 6. When to Upgrade to Pro ($25/month)

Upgrade when **any one** of these is true:

1. **Auto-pause is unacceptable** — a client experiences a slow first load after inactivity
2. **File uploads are added** — 1 GB fills up fast with real usage
3. **You need daily backups** — free plan has no automatic backups
4. **DB size approaches 400 MB** — leave headroom before hitting 500 MB
5. **You want pg_cron** — needed for scheduled tasks like reminders (Pro only)
6. **Bandwidth exceeds 4 GB/month** — real-time features + many users can push this

---

*This document should be read alongside `PROJECT_DOCUMENT.md` which covers the full codebase, component structure, and feature implementation details.*
