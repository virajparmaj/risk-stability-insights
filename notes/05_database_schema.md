# Purpose

Record the real database state of the repo and propose the smallest schema that would support the product if persistence is added.

# Status

No database exists in the repository. Proposed schema only.

# Confirmed from code

- No database client library, ORM, SQL migrations, schema file, or Supabase setup exists.
- `src/contexts/DataContext.tsx` is the only persistence layer, and it stores a reduced run object in browser localStorage.
- The backend in `backend/api.py` is stateless and does not read or write any database.

# Inferred / proposed

- Strongly inferred: a database becomes necessary if the app moves beyond a single-user demo because auth, real roles, saved runs, and auditability are all missing.
- Proposed, not implemented: use Postgres, ideally paired with Supabase if auth is added.

# Important details

## Proposed, not implemented: core tables

### `public.profiles`

Purpose: store app-level user metadata and role.

Suggested columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, references auth user ID |
| `display_name` | `text` | shown in app shell |
| `role` | `text` | `researcher` or `customer` |
| `created_at` | `timestamptz` | default now() |
| `updated_at` | `timestamptz` | default now() |

### `public.analysis_runs`

Purpose: persist scored run summaries and lineage without requiring raw-row storage by default.

Suggested columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK to `profiles.id` |
| `dataset_name` | `text` | derived from file name or user input |
| `source_filename` | `text` | nullable |
| `model_name` | `text` | copied from model card |
| `model_version` | `text` | copied from model card |
| `threshold` | `numeric(5,4)` | current low-risk threshold |
| `row_count` | `integer` | number of members |
| `mean_probability` | `numeric(8,6)` | summary metric |
| `low_risk_rate` | `numeric(8,6)` | summary metric |
| `data_quality` | `jsonb` | missing columns, replacement counts |
| `analytics` | `jsonb` | derived analytics payload |
| `scoring_source` | `text` | `api` or `fallback` |
| `created_at` | `timestamptz` | default now() |

### `public.audit_events`

Purpose: lightweight governance history for uploads, scoring, exports, and role-sensitive actions.

Suggested columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `actor_user_id` | `uuid` | FK to `profiles.id` |
| `run_id` | `uuid` | nullable FK to `analysis_runs.id` |
| `event_type` | `text` | upload, score, export, login, role_change |
| `metadata` | `jsonb` | small structured payload |
| `created_at` | `timestamptz` | default now() |

## Optional storage bucket

- Proposed, not implemented: private object-storage bucket for raw CSV uploads if the product later needs reproducible reruns.
- Strongly recommended caveat: do not persist raw cohort files unless the product truly needs them, because the current repo works without server-side file storage.

## Relationships

- `profiles.id -> analysis_runs.user_id`
- `profiles.id -> audit_events.actor_user_id`
- `analysis_runs.id -> audit_events.run_id`

## RLS / security notes

- `profiles`: user can read/update own row.
- `analysis_runs`: user can read/write own runs; widen later only if org sharing is intentionally added.
- `audit_events`: service role inserts; researchers/admins read as needed.
- Raw upload storage, if added, should be private and accessed only through signed URLs or server mediation.

# Open issues / gaps

- Not found in repository: any implemented persistence contract for runs.
- Not found in repository: any schema for user ownership, data retention, or deletion policy.
- Strongly inferred gap: the UI copy about auto-saving/history cannot be fulfilled by the current localStorage-only model.

# Recommended next steps

- If auth is added, create `profiles` immediately.
- Add `analysis_runs` only when the product needs persistent run history.
- Keep raw CSV storage optional and off by default until there is a clear governance reason to store it.
