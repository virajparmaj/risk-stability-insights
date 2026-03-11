# Purpose

Document the real frontend/backend API contracts and local fallback behavior.

# Status

One real scoring backend exists. Most analytics are local and do not use HTTP.

# Confirmed from code

- Frontend base URL:
  - `import.meta.env.VITE_API_URL`
  - fallback default: `https://risk-stability-insights.onrender.com`
  - Code: `src/services/api.ts`
- Backend endpoints are defined in `backend/api.py`.
- The frontend actively uses:
  - `GET /health`
  - `GET /model-card`
  - `POST /score-batch`
- `POST /score` exists in the backend and client service, but is not used by the current UI.

# Important details

## Confirmed endpoint table

| Method | Path | Used by frontend? | Request body | Response shape | Notes |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/` | No | none | `{ service, status, model, version }` | simple root metadata |
| `GET` | `/health` | Yes | none | `{ status, model, version }` | called on Overview mount |
| `GET` | `/model-card` | Yes | none | `{ model_name, version, target, description, required_features, deployment_notes }` | drives upload validation and docs page |
| `POST` | `/score` | No current UI | `{ data: { feature: value } }` | `{ low_risk_probability, risk_tier }` | single-record scoring |
| `POST` | `/score-batch` | Yes | `[{ feature: value }, ...]` | `{ n_scored, results: [{ low_risk_probability, risk_tier }] }` | main production scoring path |

## Request/response specifics

- `/score-batch` expects a plain array of objects, not a wrapper object.
- Missing required features return HTTP 400 with a text error containing the missing feature list.
- Empty batch payload returns HTTP 400 with `Empty payload`.
- `risk_tier` is `"Low"` when probability is `>= 0.7`, otherwise `"Standard"`.

## Frontend-to-backend interaction

### Upload flow

1. Parse CSV in-browser with Papa Parse.
2. Fetch `/model-card`.
3. Align uploaded rows to `required_features`.
4. If any required columns are missing, stop.
5. Send aligned rows to `/score-batch`.
6. Compute analytics locally from returned probabilities.

### Demo bootstrap flow

1. Start from bundled `demoRunSnapshot` if enabled.
2. On first load, try to rebuild a fresher demo run from `public/data/meps_model_ready_2023.csv`.
3. Fetch `/model-card` and `/score-batch` if the backend is reachable.
4. If that fails, use a local heuristic scorer instead of the backend model.

## Local fallback contract

- Confirmed from code: fallback scoring exists in `src/contexts/DataContext.tsx` and `scripts/build-demo-snapshot.ts`.
- Fallback formula uses local fields like cost, chronic count, K6, Rx, and age.
- Important mismatch:
  - backend `/model-card` claims the deployed model avoids cost/utilization leakage
  - fallback scoring includes `TOTEXP23` and `RXTOT23`
- This fallback path is not API-backed and is not guaranteed to match the deployed model.

## Loading and timeout behavior

- Frontend app requests do not use explicit timeouts.
- The demo snapshot build script uses a 12-second fetch timeout.
- Upload page shows a local submitting state while validating/scoring.
- Overview shows a toast if `/health` fails.
- Demo refresh shows a top-bar badge while rebuilding the bundled demo run.

## External dependencies

- FastAPI service on Render.
- Joblib model artifact loaded by the backend.
- Public demo CSV bundled in the frontend repo.

# Inferred / proposed

- Strongly inferred: `/model-card` is the real contract boundary that keeps upload validation aligned with the deployed model schema.

# Open issues / gaps

- No auth headers or API authorization exist.
- No API version prefix exists.
- No backend contract exists for saved runs, user settings, report generation, or audit logs.
- Error handling returns raw text, not structured error JSON with stable codes.

# Recommended next steps

- Add bearer-token auth before widening usage.
- Add structured error payloads if the frontend will need finer-grained handling.
- If persistence is added, create separate endpoints for saved runs rather than overloading the scoring endpoints.
