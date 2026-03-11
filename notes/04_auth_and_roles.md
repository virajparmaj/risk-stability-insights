# Purpose

Describe current role behavior and the practical auth implementation this repo is missing.

# Status

Auth is missing but needed.

# Confirmed from code

- The only role system is `RoleContext` in `src/contexts/RoleContext.tsx`.
- Supported roles are `researcher` and `customer`.
- Current role controls:
  - sidebar visibility in `src/components/layout/AppSidebar.tsx`
  - simplified insight copy in `src/components/InsightBlock.tsx`
  - direct role switching in `src/components/layout/TopBar.tsx`
  - direct role switching again in `src/pages/Settings.tsx`
- There is no login page, signup page, session token, auth provider, route guard, backend token verification, logout flow, or password reset flow.
- Researcher-only pages are only hidden in the navigation. The router in `src/App.tsx` does not protect those paths.

# Inferred / proposed

- Strongly inferred: auth is required if this app will be used for real healthcare or insurer cohorts because it supports uploads, exports, fairness review, and separate researcher/customer views.
- Strongly inferred: the current role switch is a demo convenience, not an acceptable production access-control mechanism.

# Important details

## Why auth is needed

- Uploaded cohort data is sensitive by nature, even if the current repo only handles it in-browser.
- The app already models distinct user experiences for researchers and customers.
- Export pages and fairness/pricing views should not be anonymously accessible in a real deployment.
- The backend scoring API is currently public and unauthenticated.

## Recommended auth approach

- Strongly inferred / proposed: use Supabase Auth plus a small Postgres profile table.
- Why this fits this repo:
  - the frontend is a browser SPA
  - the backend is stateless and easy to protect with bearer-token verification
  - the repo also lacks a database, and Supabase can cover both auth and basic persistence
- If Supabase is not desired, Clerk/Auth0 are viable for auth alone, but you will still need a separate DB for roles and saved runs.

## Required roles

- Required now:
  - `researcher`
  - `customer`
- Optional later:
  - `admin`
  - Not found in repository, but useful if you add user management and invites.

## Route protection plan

| Route group | Current code | Recommended rule |
| --- | --- | --- |
| `/`, `/segmentation`, `/low-risk`, `/pricing`, `/fairness`, `/reports`, `/docs` | public, no guard | authenticated `researcher` or `customer` |
| `/upload`, `/scoring`, `/risk-lab`, `/settings` | public, nav-hidden for customer | authenticated `researcher` only |
| `/login`, `/forgot-password`, `/reset-password` | not found | public |

## Session handling plan

- Add `src/lib/supabase.ts` for client creation.
- Add `src/contexts/AuthContext.tsx` or equivalent session hook.
- Load session before rendering protected routes.
- Replace the current manual role switch with a role read from the logged-in user's profile.
- Keep `RoleContext` only if it becomes a thin derived wrapper around the authenticated profile role; otherwise remove it.
- Attach the auth token in `src/services/api.ts` for `/score` and `/score-batch`.
- Verify JWTs in FastAPI before scoring requests.

## Signup / login / reset flow

- Recommended:
  1. Add `/login` with email/password sign-in.
  2. Add `/forgot-password` and reset-email flow.
  3. Prefer invite-based account creation for `customer` users.
  4. On first login, create or upsert a `profiles` row with the assigned role.
  5. Redirect authenticated users to `/`.
- Not found in repository: any current onboarding or account lifecycle flow.

## DB tables and policies needed

- Minimum table:
  - `public.profiles`
  - columns: `id`, `display_name`, `role`, `created_at`, `updated_at`
- If saved runs are added:
  - `public.analysis_runs`
- If governance matters:
  - `public.audit_events`
- Supabase RLS:
  - users can read/update their own profile
  - users can read their own runs
  - `researcher` or `admin` policies can be widened later if org sharing is needed

## Files likely to be added or changed

- Frontend:
  - `src/App.tsx`
  - `src/services/api.ts`
  - `src/components/layout/TopBar.tsx`
  - `src/components/layout/AppSidebar.tsx`
  - `src/pages/Settings.tsx`
  - new `src/pages/Login.tsx`
  - new `src/pages/ForgotPassword.tsx`
  - new `src/components/auth/*`
  - new `src/lib/supabase.ts`
  - new `src/contexts/AuthContext.tsx`
- Backend:
  - `backend/api.py`
  - new `backend/auth.py` or a token verification dependency module

## Env vars needed

- Frontend:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`
- Backend:
  - `SUPABASE_JWKS_URL` or equivalent JWT verification config
  - `MODEL_PATH`

# Open issues / gaps

- Current role switching is intentionally insecure.
- There is no route-level or API-level authorization.
- Settings currently lets any user flip roles directly.

# Recommended next steps

1. Add auth before adding more product surface area.
2. Replace the current role toggle with authenticated profile-driven roles.
3. Protect FastAPI scoring endpoints with bearer-token verification.
4. Add profile and run persistence only after the auth model is in place.
5. Remove or clearly mark mock settings until they are real.

# Step-by-step implementation checklist

1. Add Supabase client libraries and create a project.
2. Create `profiles` with `role` constrained to `researcher` or `customer`.
3. Add `AuthContext` and protected-route wrappers in the frontend.
4. Add `/login` and password reset pages.
5. Remove direct role selection from `TopBar` and `Settings`.
6. Update `services/api.ts` to send bearer tokens.
7. Verify JWTs in `backend/api.py` before `/score` and `/score-batch`.
8. Lock researcher-only pages at both the router and backend/API boundary.
9. Add RLS policies and test both roles end to end.
