# Purpose

Summarize what this repository actually builds today.

# Status

Functional analytical prototype with a real scoring API, but not a production-ready multi-user product.

# Confirmed from code

- The product is a React/Vite single-page analytics app for uploading MEPS-style CSV cohorts, validating them against a live model schema, batch-scoring members, and exploring the result across overview, segmentation, fairness, pricing, uncertainty, and export pages.
- The frontend route tree is defined in `src/App.tsx` and centers on one active `currentRun` shared through `src/contexts/DataContext.tsx`.
- The backend in `backend/api.py` is a small FastAPI scoring service that loads one joblib model artifact and exposes `/health`, `/model-card`, `/score`, and `/score-batch`.
- CSV parsing happens in the browser with Papa Parse in `src/pages/Upload.tsx`; analytics are computed in the browser by `src/lib/runAnalytics.ts` and `src/lib/analytics.ts`.
- Demo data is bundled in the repo at `public/data/meps_model_ready_2023.csv`, and the app auto-seeds a demo run from `src/data/demoRunSnapshot.ts` or by rebuilding a run from the public CSV on first load.

# Inferred / proposed

- Strongly inferred: the intended users are healthcare researchers, insurer or actuarial stakeholders, and customer viewers who need a simplified readout of the same scored cohort.
- Strongly inferred: the main business problem is identifying low-risk members and turning that score into pricing, retention, fairness, and governance views without retraining a model inside the app.

# Important details

- Core user journey:
  1. Land on the dashboard, usually already populated by bundled demo data.
  2. Upload a CSV on `/upload`.
  3. Validate the file against the live backend model card.
  4. Batch-score the aligned rows with `/score-batch`.
  5. Explore the same run across all downstream pages.
  6. Export CSV artifacts from the browser.
- Current implementation maturity:
  - Frontend analytics experience: confirmed implemented.
  - Backend scoring service: confirmed implemented.
  - Auth, secure roles, saved runs, database persistence, admin flows: not found in repository.
- Repo reality:
  - Actually implemented: one browser session, one active run, one scoring API, client-side analytics, local CSV export, demo bootstrapping, and a UI-only role switch.
  - Aspirational or only implied by copy/UI: secure researcher vs customer access, persistent settings, saved run history, governed deployment controls, and any real account system.

# Open issues / gaps

- No auth or secure role enforcement exists.
- No database or backend persistence exists.
- Settings, role switching, and research/production mode are partly present as UX but not backed by real system behavior.
- The app uses demo and fallback paths that can diverge from the live backend model.

# Recommended next steps

- Decide whether this repo is staying a single-user analytical demo or becoming a secure multi-user product.
- If it is becoming a real product, implement auth first, then persisted runs, then tighten deployment and governance controls.
- Align fallback/demo behavior with the live model contract so the product story stays consistent.
