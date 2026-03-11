# Purpose

List the highest-signal risks and implementation gaps visible in the repository.

# Status

This list is based on repository inspection plus one local lint/build check.

# Critical

- No real auth or secure role enforcement exists.
  - Confirmed from code: roles are plain React state in `src/contexts/RoleContext.tsx`, and routes are not protected in `src/App.tsx`.
- Backend scoring endpoints are unauthenticated.
  - Confirmed from code: `backend/api.py` has no auth dependency or token check.
- Sensitive run data is handled without a secure persistence boundary.
  - Confirmed from code: the app keeps the active run in browser memory and stores a reduced copy in localStorage.
- Demo/fallback scoring can diverge from the live backend model.
  - Confirmed from code: fallback logic in `src/contexts/DataContext.tsx` and `scripts/build-demo-snapshot.ts` uses cost/utilization-like fields, while the backend model card claims the deployed model avoids that leakage.

# Medium

- Role and mode UX are only partially real.
  - Confirmed from code: role changes hide nav items and simplify copy, but do not secure pages.
  - Confirmed from code: production/research mode appears in the top bar but is not used elsewhere.
- `/settings` is mostly mock UI and contains misleading values.
  - Confirmed from code: fake API key placeholder, `Connected` badge, and `http://localhost:8000/api/v1` default endpoint do not match the real backend contract.
- Reloaded runs lose source rows and aligned rows.
  - Confirmed from code: `persistRun()` drops `sourceRows` and `alignedRows`, which reduces later export and drill-down fidelity.
- Fairness logic is inconsistent between precomputed analytics and the live page.
  - Confirmed from code: `runAnalytics.ts` precomputes different subgroup fields/minimum sizes than `analytics.ts` and `src/pages/Fairness.tsx`.
- Lint is not clean.
  - Confirmed by local run: `npm run lint` fails with 4 errors and 10 warnings.
- No automated tests were found.
  - Not found in repository.
- Frontend bundle is large.
  - Confirmed by local build: the main bundle is about 2.9 MB before gzip warning output.

# Low

- React Query is provided globally but not meaningfully used in the app.
  - Confirmed from code: `QueryClientProvider` exists, but no `useQuery` or `useMutation` calls were found.
- Theme support is incomplete.
  - Confirmed from code: `next-themes` is read in `src/components/ui/sonner.tsx`, but no app-level `ThemeProvider` was found.
- Some code appears unused or template-derived.
  - Confirmed from code: `src/lib/buildSegmentationMatrix.ts`, `exportToCSVWithLabels()`, and `scoreMember()` are currently unused.
- Branding and attribution are slightly inconsistent.
  - Confirmed from code: README, footer, and HTML metadata do not use one fully consistent product/author string.
- Multiple lockfiles exist.
  - Confirmed from code: `package-lock.json` and `bun.lockb` are both present.

# Important details

- `npm run build` does succeed, so the repo is buildable even though lint is not clean.
- Some misleading UI is not broken code, but it is still a documentation and trust risk.

# Recommended next steps

- Fix auth and route/API protection before broadening access.
- Decide whether the product will support persistent runs; if yes, replace the current reduced localStorage model.
- Align fallback/demo behavior with the live model contract.
- Make lint and basic analytics tests part of normal development.
