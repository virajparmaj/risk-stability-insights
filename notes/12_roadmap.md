# Purpose

Provide a practical, repo-specific roadmap based on what is already built and what is missing.

# Status

The right next steps are mostly about hardening the existing product shape rather than adding more pages.

# Immediate fixes

- Implement authentication and remove the manual role switch from the top bar/settings.
- Add route guards and backend token verification for scoring endpoints.
- Fix the misleading `/settings` page or clearly mark it as non-functional.
- Add `.env.example` for the variables already used by the repo.
- Fix the current lint errors so the repo can enforce baseline code quality.

# Short-term improvements

- Persist runs outside localStorage if run history is a real feature.
- Preserve enough source/aligned data for exports and segment/fairness drill-down after refresh.
- Align fallback scoring and demo snapshot generation with the live backend model contract.
- Unify fairness calculations so the same subgroup rules apply before and after reload.
- Add tests around:
  - upload validation
  - feature alignment
  - scoring response handling
  - analytics summaries

# Medium-term improvements

- Add account-based customer/researcher access with a real profiles table.
- Add saved run metadata, audit events, and basic lineage history.
- Add route-level code splitting to reduce the initial JS payload.
- Add a stable backend deployment contract to the repo if multiple maintainers will own it.
- Decide whether pricing and governance outputs should remain lightweight calculators or become persisted/reportable artifacts.

# Long-term enhancements

- Add admin workflows for invites, roles, and access review.
- Add shareable reports or server-side report generation if exports need to be reproducible.
- Add model/version registry support if more than one model will be served.
- Add organization-level data sharing only after auth, RLS, and audit requirements are in place.

# Infra / auth / data improvements

- Prefer one source of truth for roles and sessions.
- Introduce a real database only when auth or saved runs require it.
- Keep raw CSV storage optional; do not add it by default unless reproducibility requirements justify the sensitivity tradeoff.

# Product polish

- Clarify "research" vs "production" semantics in the UI or remove the distinction until it is functional.
- Rename misleading labels like "feature importance" where the chart is actually coverage.
- Standardize product naming and attribution strings across HTML, README, and app shell.
