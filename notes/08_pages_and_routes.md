# Purpose

Map the route structure that actually exists in the SPA.

# Status

All routes are declared in `src/App.tsx`. No route guard layer exists.

# Confirmed from code

| Path | Purpose | Current access | Recommended auth in a real product | Primary components / logic | Data dependencies | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Run overview dashboard | Public | Authenticated `researcher` or `customer` | `src/pages/Overview.tsx`, dashboard widgets | `currentRun`, `/health` | Implemented |
| `/upload` | CSV upload, validation, scoring trigger | Public; hidden from customer nav only | Authenticated `researcher` | `src/pages/Upload.tsx` | local file, `/model-card`, `/score-batch` | Implemented |
| `/scoring` | Score summary and export | Public; hidden from customer nav only | Authenticated `researcher` | `src/pages/Scoring.tsx` | `currentRun`, `/model-card` | Implemented |
| `/segmentation` | Quartile segmentation explorer | Public | Authenticated `researcher` or `customer` | `src/pages/Segmentation.tsx`, scatter/table/sheet | `currentRun`, aligned rows for drivers | Implemented |
| `/low-risk` | Low-risk vs standard profile comparison | Public | Authenticated `researcher` or `customer` | `src/pages/LowRiskProfile.tsx` | `currentRun`, aligned rows | Implemented |
| `/risk-lab` | Calibration and uncertainty diagnostics | Public; hidden from customer nav only | Authenticated `researcher` | `src/pages/RiskLab.tsx` | `currentRun`, labels if available | Implemented |
| `/pricing` | Scenario calculator | Public | Authenticated `researcher` or `customer` | `src/pages/PricingSimulator.tsx` | `currentRun.summary` | Implemented |
| `/fairness` | Subgroup fairness review | Public | Authenticated `researcher` or `customer` | `src/pages/Fairness.tsx` | `currentRun`, source/aligned rows | Implemented |
| `/reports` | Export hub | Public | Authenticated `researcher` or `customer` | `src/pages/Reports.tsx` | `currentRun`, source rows for full export | Implemented |
| `/docs` | Model card and feature schema docs | Public | Authenticated `researcher` or `customer` | `src/pages/Documentation.tsx` | `currentRun.modelCard` or `/model-card` | Implemented |
| `/settings` | Preferences and integration settings UI | Public; hidden from customer nav only | Authenticated `researcher` | `src/pages/Settings.tsx` | `role` only | Partially implemented / mostly mock |
| `*` | 404 page | Public | none | `src/pages/NotFound.tsx` | current URL only | Implemented |

# Inferred / proposed

- Not found in repository:
  - `/login`
  - `/forgot-password`
  - `/reset-password`
  - any admin route
  - any onboarding route
  - any dedicated landing/marketing route

# Important details

- `BrowserRouter` is used, and the Vercel config rewrites all paths to `/` for SPA handling.
- The sidebar is the only place that currently filters what a user sees by role.
- Several pages depend on `sourceRows` or `alignedRows`; those are not kept in localStorage, so some route behavior changes after refresh.

# Open issues / gaps

- Direct navigation bypasses the intended researcher/customer restrictions.
- There is no anonymous-vs-authenticated route split.
- `/settings` looks live but does not manage real settings.

# Recommended next steps

- Add route guards before expanding user-facing access.
- Add explicit auth/account routes if the product is going beyond a demo.
- Consider a true landing route if the app needs a public entry point separate from the dashboard.
