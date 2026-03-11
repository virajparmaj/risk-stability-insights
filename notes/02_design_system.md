# Purpose

Describe the actual design language implemented in the repository.

# Status

Implicit design system. Tokens and component primitives exist, but there is no separate design-system documentation package.

# Confirmed from code

- Design tokens live in `src/index.css` and `tailwind.config.ts`.
- Visual aesthetic:
  - Light neutral background and card surfaces.
  - Green is the dominant semantic accent for primary actions and "low risk".
  - Amber is used for uncertainty and warnings.
  - Red is used for high risk or destructive states.
  - Charts use green-forward tones plus gray.
- Color usage:
  - `--primary`: green (`161 93% 30%`)
  - `--risk-low`: green
  - `--risk-medium`: amber
  - `--risk-high`: red
  - `--background`: light gray
  - `--card`: near-white
- Typography:
  - Sans: Work Sans
  - Serif: Lora
  - Mono: Inconsolata
  - Most UI uses the sans stack; mono is used for technical labels like model/version badges.
- Shape and spacing:
  - Global radius token is `0.75rem`.
  - UI is card-heavy with thin borders and subtle shadows.
  - Layout uses a permanent sidebar, top bar, and padded content area.
- Interaction style:
  - Mostly standard shadcn/Radix controls: selects, switches, radio groups, tooltips, sheets, badges, toasts.
  - The sidebar can collapse to icons.
  - Charts expose hover tooltips and export buttons.
- Animation usage:
  - Confirmed in code: Tailwind includes accordion open/close animations.
  - Strongly inferred: most page interactions are intentionally low-motion beyond component defaults.
- UI primitives are standard shadcn/ui generated components.
  - Code: `src/components/ui/*`, `components.json`

# Inferred / proposed

- Strongly inferred: the intended tone is "clinical analytics dashboard" rather than consumer product or marketing site.
- Strongly inferred: the product prioritizes clarity and governance cues over branding flair.

# Important details

- The design language is consistent on analytics pages:
  - card containers
  - small data-density tables
  - subdued muted copy
  - green/amber/red semantics tied to risk
- Insight panels intentionally simplify language for the `customer` role.
  - Code: `src/components/InsightBlock.tsx`
- Dark theme tokens exist in CSS, and `src/components/ui/sonner.tsx` reads `next-themes`.
  - Not found in repository: any `ThemeProvider`, theme toggle, or actual dark-mode wiring in the app tree.

# Open issues / gaps

- No formal design guidelines file exists.
- Dark-mode support appears incomplete.
- `/settings` visually implies real preferences, but those controls are not backed by state or persistence.
- Branding is slightly inconsistent across the repo:
  - `index.html` calls it "Risk Stability Analytics | Profit Stabilization Platform".
  - the app shell says "Risk Stability Analytics Platform".
  - footer/README attribution strings differ.
- The component name `FeatureImportanceChart` does not match its actual content, which is feature coverage.

# Recommended next steps

- Document the current token set and semantics as an explicit design contract.
- Either finish dark-mode support or remove the implied support from shared components.
- Align titles and labels with actual analytics behavior to reduce UX drift.
