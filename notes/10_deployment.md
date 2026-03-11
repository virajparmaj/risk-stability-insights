# Purpose

Capture the deployment clues that are actually in the repository.

# Status

Frontend and backend appear to be deployed separately. Frontend deployment is partially repo-configured; backend deployment is mostly external to the repo.

# Confirmed from code

- Frontend deployment clues:
  - `vercel.json` rewrites all routes to `/` for SPA routing.
  - Backend CORS allowlist includes `https://risk-stability-insights.vercel.app`.
- Backend deployment clues:
  - README says the backend is deployed on Render.
  - Frontend default API URL is `https://risk-stability-insights.onrender.com`.
- Build artifacts:
  - frontend output goes to `dist/`
  - backend loads a local model artifact from `backend/artifacts/low_risk_model_B3_chronic_xgb.joblib`

# Inferred / proposed

- Strongly inferred frontend target: Vercel.
- Strongly inferred backend target: Render.
- Not found in repository:
  - `render.yaml`
  - `Dockerfile`
  - `netlify.toml`
  - a backend Procfile
  - environment-specific config files for staging vs production

# Important details

## Frontend deployment

- Build command:

```bash
npm run build
```

- Output directory:

```text
dist/
```

- SPA routing support is handled by:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## Backend deployment

- The repo contains only:
  - `backend/api.py`
  - `backend/requirements.txt`
  - the tracked model artifact
- Strongly inferred: the Render service start command is configured outside the repo.
- Backend availability is critical for live upload validation and production scoring.

## Environment separation

- Not found in repository:
  - staging env files
  - separate frontend config per environment
  - backend deployment manifests
- Current repo behavior assumes one production backend URL by default.

## Deployment dependencies

- Frontend depends on:
  - reachable FastAPI backend
  - correct `VITE_API_URL` if not using the default Render service
- Backend depends on:
  - Python dependencies from `backend/requirements.txt`
  - readable model artifact path via `MODEL_PATH`

# Open issues / gaps

- CORS allowlist is narrow; preview domains or custom frontend domains will fail unless backend config is updated.
- There is no repo-level documentation for backend deployment commands.
- The frontend bundle is large, which may affect initial load on production.
- The model artifact is checked into the repo; that simplifies deployment but makes artifact versioning and release discipline more important.
- No deployment health gating exists between model changes and frontend expectations.

# Recommended next steps

- Recommended release order if frontend and backend are coupled:
  1. Deploy and verify backend `/health` and `/model-card`.
  2. Verify the model schema has not changed unexpectedly.
  3. Deploy frontend with the correct `VITE_API_URL`.
  4. Smoke-test upload, scoring, and docs page against the live backend.
- Add backend deployment metadata to the repo if this project is going to be maintained by multiple people.
