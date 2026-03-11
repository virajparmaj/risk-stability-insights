# Purpose

Reusable context for future coding agents working in this repository.

# Status

Current-state context, based on implemented code rather than product aspirations.

# Confirmed from code

- This app is a Vite/React/TypeScript SPA for MEPS-style healthcare cohort analysis.
- The core flow is:
  - parse CSV locally
  - fetch live model card
  - align required features
  - batch-score with FastAPI
  - compute analytics client-side
  - explore one shared `currentRun` across routes
- Frontend routes live in `src/App.tsx`.
- Shared state lives in `src/contexts/DataContext.tsx` and `src/contexts/RoleContext.tsx`.
- The backend in `backend/api.py` is only a scoring/model-card service.
- There is no auth, no DB, no saved-run backend, and no real admin layer.

# Design rules

- Preserve the current clinical/enterprise dashboard language:
  - neutral backgrounds
  - green/amber/red risk semantics
  - card-based layouts
  - dense but readable analytics UI
- Do not introduce flashy marketing patterns into existing app pages unless explicitly requested.
- Keep exports and analytics pages consistent with the current shadcn/Tailwind visual system.

# Architecture rules

- Do not invent backend persistence or auth that is not in the repo.
- Treat the backend as a thin scoring service unless you are explicitly asked to expand it.
- Preserve the current "single active run" mental model unless the task is specifically about multi-run history.
- Be careful with changes to `DataContext`: many pages assume the same run shape.
- Be careful with fallback/demo logic: it is part of the current first-load experience.

# Things to preserve

- Upload -> validate -> score -> analyze flow.
- Live `/model-card`-driven schema validation.
- Client-side analytics and CSV exports.
- The researcher/customer content simplification pattern, if roles are being kept.

# Known weak points

- Auth and secure role enforcement are missing.
- Persisted runs lose source/aligned rows after refresh.
- Demo/fallback scoring can diverge from the live model.
- `/settings` is mostly mock UI.
- Lint is not clean and no tests are present.
- The frontend bundle is large.

# How future agents should behave

- Inspect actual routes, contexts, analytics helpers, and backend contracts before changing behavior.
- Label uncertain statements as confirmed, strongly inferred, or not found.
- Do not claim features like login, saved runs, or database tables already exist.
- If you add auth or persistence, update both the frontend route behavior and the backend/API contract together.
- Prefer tightening existing behavior over adding more surface area.
