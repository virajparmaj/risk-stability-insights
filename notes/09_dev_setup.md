# Purpose

Explain how to run this repo locally based on the files that actually exist.

# Status

Frontend setup is straightforward. Backend setup is simple but inferred from the FastAPI file rather than documented in repo scripts.

# Confirmed from code

## Detectable stack versions

- Node-side packages:
  - React `18.3.1`
  - Vite `7.2.7`
  - TypeScript `5.8.3`
  - Tailwind CSS `3.4.17`
  - React Router `6.30.1`
  - Recharts `2.15.4`
- Python-side packages:
  - `fastapi`
  - `uvicorn`
  - `pandas`
  - `numpy`
  - `scikit-learn==1.7.2`
  - `xgboost`
  - `joblib`

## Frontend commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Repo scripts

- `npm run dev`
- `npm run build`
- `npm run build:dev`
- `npm run build:demo-snapshot`
- `npm run lint`
- `npm run preview`

## Environment variables used by code

Frontend runtime:

- `VITE_API_URL`
  - backend base URL
- `VITE_DEMO_SNAPSHOT_BOOTSTRAP`
  - toggles use of bundled demo snapshot bootstrap

Backend runtime:

- `MODEL_PATH`
  - path to the joblib model artifact

Snapshot build script:

- `DEMO_API_URL`
  - backend URL used by `scripts/build-demo-snapshot.ts`
- `DEMO_CSV_PATH`
  - local CSV path used by `scripts/build-demo-snapshot.ts`

## Files and configs present

- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `eslint.config.js`
- `vercel.json`
- `backend/requirements.txt`

# Inferred / proposed

## Strongly inferred local backend startup

From `backend/api.py`, the likely dev command is:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

If you do that, the matching frontend env is strongly inferred to be:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

# Important details

- The frontend dev server runs on port `8080` by default.
  - Code: `vite.config.ts`
- The backend CORS allowlist includes localhost `3000` and `8080`.
- The repo contains a large demo CSV and a generated demo snapshot, so the app can still show a populated dashboard without a working backend.
- `npm run build:demo-snapshot` will generate `src/data/demoRunSnapshot.ts`.

# Open issues / gaps

- Not found in repository: `.env.example`.
- Not found in repository: backend run script or Render service manifest.
- `npm run lint` currently fails with 4 errors and 10 warnings.
- `npm run build` passes, but the main JS bundle is very large.
- Both `package-lock.json` and `bun.lockb` exist, but npm is the only documented/scripted package manager path.

# Recommended next steps

- Add `.env.example` with the variable names already used by the repo.
- Add a small backend README or script so local API startup is explicit instead of inferred.
- Fix the current lint failures before adding CI.
