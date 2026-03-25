# Purpose

Describe the implemented user flows and where they break or stop.

# Status

The main analytical flow works. Account-based flows do not exist.

# Confirmed from code

## Landing / first visit

1. The app opens at `/`.
2. `DataContext` tries to load the last reduced run from localStorage.
3. If nothing is present, it can seed from `demoRunSnapshot`.
4. It then tries once to rebuild a fresher demo run from `public/data/meps_model_ready_2023.csv`.
5. Result: most first-time visitors see a populated demo dashboard. If seeding fails, the Overview shows a reusable `EmptyState` component with a "Go to Upload" CTA.

## Upload and score flow

1. Go to `/upload`.
2. Select a local CSV file via the file picker or drag-and-drop onto the upload zone.
3. Upload zone switches to a "file loaded" state showing filename and row count. The file is parsed in the browser.
4. Click `Validate Only` (formerly "Research Validation") to validate schema only.
5. Or click `Score for Production` to:
   - fetch the model card
   - align required features
   - batch-score rows via the backend
   - compute analytics locally
   - store the run in `DataContext`
6. Then navigate to overview, scoring, segmentation, fairness, reports, and other pages.

## Scoring review and export flow

1. Open `/scoring`.
2. Review aggregate run metrics.
3. Toggle between threshold view and top-30%-rank view for display only.
4. Export either:
   - source rows plus scores, if `sourceRows` are still available in memory
   - or a scores-only CSV

## Segmentation flow

1. Open `/segmentation`.
2. Review quartile segments and scatter plot.
3. Click a segment table row.
4. Read the drawer summary and top feature contrasts if aligned rows are available.
5. Export segments CSV.

## Low-risk profile flow

1. Open `/low-risk`.
2. Compare low-risk vs standard-risk averages for selected fields.
3. Review chart and table.
4. Export profile CSV.

## Risk lab flow

1. Open `/risk-lab`.
2. Review bootstrap CI, calibration bins, and threshold sensitivity.
3. Export calibration CSV.

## Fairness flow

1. Open `/fairness`.
2. The page checks whether demographic fields exist in the run.
3. If subgroup sizes are large enough, it renders predicted vs actual bars and a subgroup table.
4. Export fairness CSV.

## Pricing flow

1. Open `/pricing`.
2. Adjust base premium, admin load, and risk margin.
3. Review three deterministic scenarios and cumulative profit chart.
4. Export scenario CSV.

## Reports flow

1. Open `/reports` or click `Generate Report` in the top bar.
2. Export scored dataset, run summary, or calibration CSV.
3. Review a simple checklist card for lineage metadata.

## Customer flow

1. Switch the role to `customer` in the top bar or settings.
2. The sidebar hides researcher-only pages.
3. Insight text becomes shorter and simpler.

# Inferred / proposed

- Strongly inferred: there should eventually be a real login flow before any customer-facing deployment.

# Important details

## Save / edit / delete behavior

- Save:
  - Confirmed from code: the app auto-persists a reduced run in localStorage.
  - Not found in repository: any saved-run history UI.
- Edit:
  - Not found in repository: any way to edit uploaded data or rerun only part of a cohort.
- Delete:
  - Not found in repository: any delete/archive flow for runs.

## Signup / login / profile / admin

- Signup/login/reset:
  - Not found in repository.
- Profile:
  - Not found in repository beyond static fields on `/settings`.
- Admin:
  - Not found in repository.

# Open issues / gaps

- Research validation does not create a reusable run.
- Role/customer flows are demo-only and unsecured.
- After a page reload, some flows degrade because `sourceRows` and `alignedRows` are no longer persisted.
- Settings looks like a profile/preferences flow but does not save anything.

# Recommended next steps

- Add real auth before treating customer/researcher as real personas.
- Decide whether saved runs are a real feature; if yes, persist them outside localStorage.
- Either wire settings for real or mark the page as non-functional.
