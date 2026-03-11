# Purpose

Catalog implemented and implied product features with code references.

# Status

Mixed: many analytical pages are implemented, while security, persistence, and some controls are only partial or implied.

# Confirmed implemented

- Local CSV upload and parse from the browser.
  - Code: `src/pages/Upload.tsx`
- Schema validation against the live backend model card.
  - Code: `src/pages/Upload.tsx`, `src/services/api.ts`, `backend/api.py`
- Feature alignment and numeric coercion with diagnostics.
  - Code: `src/lib/alignFeatures.ts`
- Batch scoring against the FastAPI backend.
  - Code: `src/pages/Upload.tsx`, `src/services/api.ts`, `backend/api.py`
- Demo bootstrap and backend-unavailable fallback scoring.
  - Code: `src/contexts/DataContext.tsx`, `src/data/demoRunSnapshot.ts`, `scripts/build-demo-snapshot.ts`
- Shared run state across the app.
  - Code: `src/contexts/DataContext.tsx`
- Overview dashboard with KPIs, risk distribution, low-risk split, feature coverage, cost distribution, narrative panel, and run metadata.
  - Code: `src/pages/Overview.tsx`, `src/components/dashboard/*`
- Segmentation explorer with quartile segments, scatter plot, segment table, drawer detail, and CSV export.
  - Code: `src/pages/Segmentation.tsx`, `src/components/dashboard/CostRiskScatter.tsx`, `src/components/dashboard/SegmentSummaryTable.tsx`
- Low-risk profile comparison for selected features.
  - Code: `src/pages/LowRiskProfile.tsx`
- Stability and uncertainty diagnostics: bootstrap CI, calibration, threshold sensitivity.
  - Code: `src/pages/RiskLab.tsx`, `src/lib/analytics.ts`, `src/lib/runAnalytics.ts`
- Fairness view with subgroup comparisons and disparity status.
  - Code: `src/pages/Fairness.tsx`, `src/lib/analytics.ts`, `src/lib/runAnalytics.ts`
- Pricing simulator with deterministic scenario calculations and monthly projection chart.
  - Code: `src/pages/PricingSimulator.tsx`
- Reports/export hub with scored dataset, run summary, and calibration exports.
  - Code: `src/pages/Reports.tsx`, `src/lib/exportCsv.ts`
- Model and feature documentation page backed by `/model-card`.
  - Code: `src/pages/Documentation.tsx`, `backend/api.py`
- Browser-side CSV export across multiple pages.
  - Code: `src/lib/exportCsv.ts`

# Partially implemented

- Role-based access.
  - Confirmed from code: `researcher` and `customer` roles exist in `src/contexts/RoleContext.tsx`, and the sidebar hides pages by role in `src/components/layout/AppSidebar.tsx`.
  - Gap: routes are not actually protected; manual navigation still works.
- Customer-friendly copy simplification.
  - Confirmed from code: `src/components/InsightBlock.tsx`
  - Gap: this is presentation-only, not a separate secure experience.
- Research vs production mode.
  - Confirmed from code: mode state exists in `src/contexts/RoleContext.tsx`, and the top bar shows a mode badge in `src/components/layout/TopBar.tsx`.
  - Gap: the mode does not drive analytics, routing, or backend behavior.
- Research validation flow.
  - Confirmed from code: `/upload` has a validation-only button.
  - Gap: it does not create a saved research run or affect the rest of the app.
- Settings.
  - Confirmed from code: `/settings` renders controls.
  - Gap: almost all controls are static defaults with no persistence or backend integration.
- Demo snapshot.
  - Confirmed from code: the app bootstraps from a generated snapshot and refreshes demo data on first load.
  - Gap: the snapshot can be generated from a fallback model path that does not match the live backend.

# Not implemented but implied

- Login, logout, signup, password reset, session handling.
  - Not found in repository.
- Real route protection and API authorization.
  - Not found in repository.
- Saved run history, run deletion, run sharing, or audit trail.
  - Not found in repository.
- Persistent profile/settings management.
  - Not found in repository.
- Backend-managed report generation or PDF exports.
  - Not found in repository.
- Organization or tenant management.
  - Not found in repository.

# Nice-to-have / future

- True model registry and model selection.
  - Strongly inferred from the settings copy, but not implemented.
- Real fairness policy thresholds configurable by admins.
  - Strongly inferred from the governance framing, but not implemented.
- Shareable reports and saved scenario comparisons.
  - Strongly inferred from the reports and pricing pages, but not implemented.

# Important details

- The frontend only uses `/health`, `/model-card`, and `/score-batch`. `scoreMember()` exists in `src/services/api.ts` but is not wired into the UI.
- The chart named `FeatureImportanceChart` is actually a feature coverage chart and explicitly says it is not model importance.

# Open issues / gaps

- Several features look production-oriented in the UI but are still demo-level under the hood.
- Sensitive-flow features like role separation and exports have no authentication or audit system.

# Recommended next steps

- Convert the partial features first: auth, real route protection, persistent settings, and saved run history.
- Rename or document misleading feature labels where the code already behaves differently from the title.
