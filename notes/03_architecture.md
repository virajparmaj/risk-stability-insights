# Purpose

Document the technical structure of the application as implemented.

# Status

Frontend-heavy SPA architecture with a thin scoring backend and no database/auth layer.

# Confirmed from code

- Frontend stack:
  - React 18
  - TypeScript
  - Vite
  - React Router v6
  - Tailwind CSS
  - shadcn/ui + Radix UI
  - Recharts
  - Papa Parse
  - TanStack Query provider present in `src/App.tsx`
- Backend stack:
  - FastAPI
  - pandas
  - scikit-learn / xgboost model artifact
  - joblib model loading
- Hosting and deployment clues:
  - Frontend Vercel routing config exists in `vercel.json`.
  - README and default API URL point to Render for the backend.
  - Backend CORS explicitly allows the Vercel production URL plus local dev origins.
- State management:
  - `DataContext` owns the single active run.
  - `RoleContext` owns role and mode UI state.
  - localStorage stores a reduced run snapshot under `risk-stability-current-run-v2`.
- Data flow:
  - Upload page parses CSV in the browser.
  - The frontend fetches `/model-card` to learn required features.
  - Rows are aligned/coerced locally.
  - The frontend posts aligned rows to `/score-batch`.
  - The frontend computes analytics locally from the scored run.
  - The run is shared across routes via context and partially persisted to localStorage.
- API flow:
  - `src/services/api.ts` uses `fetch()` with `VITE_API_URL` or a Render default URL.
  - Frontend calls are unauthenticated.
- Third-party services:
  - Google Fonts are loaded from `src/index.css`.
  - No database service, auth service, or object storage integration was found.
- Storage / auth / DB / ML integrations:
  - ML integration is real: the backend loads `backend/artifacts/low_risk_model_B3_chronic_xgb.joblib`.
  - Auth: not found in repository.
  - Database: not found in repository.
  - File/object storage: not found in repository.

# Inferred / proposed

- Strongly inferred: the frontend is intended to be deployed independently from the backend, with the backend treated as a model-serving API.
- Strongly inferred: React Query was added from a template or for future expansion, because current page data loading uses direct `fetch()` calls and local state instead of `useQuery`.

# Important details

- Architecture diagram:

```text
Browser SPA (React/Vite)
  |
  |-- loads bundled demo CSV from /public/data
  |-- loads bundled demo snapshot from src/data/demoRunSnapshot.ts
  |-- fetches FastAPI /health, /model-card, /score-batch
  |-- computes analytics locally (segments, fairness, calibration, profile)
  |-- stores reduced currentRun in localStorage
  |-- exports CSV files locally from the browser
  |
FastAPI scoring service
  |
  |-- loads joblib/XGBoost model artifact at startup
  |-- exposes one model card and batch/single scoring endpoints
  |
No database
No auth provider
No backend persistence
```

- Two analytics layers exist:
  - `src/lib/runAnalytics.ts` precomputes analytics at run creation time.
  - `src/lib/analytics.ts` derives summary and drill-down stats from the stored run.
- The app deliberately avoids uploading CSV files to the backend; only aligned feature rows are sent for scoring.
- Persisted runs intentionally drop `sourceRows` and `alignedRows`, which keeps localStorage smaller but limits what can be reconstructed later.

# Open issues / gaps

- No route guards or backend auth checks.
- No durable persistence for runs, settings, or users.
- Some analysis logic is duplicated across `runAnalytics.ts` and `analytics.ts`, which increases drift risk.
- The frontend bundle is large for a single SPA build.

# Recommended next steps

- Add a real auth/persistence boundary before expanding product scope.
- Consolidate analytics derivation rules so the first-run and reloaded-run behavior stay aligned.
- Split routes and heavy chart pages into lazy chunks if frontend performance matters.
