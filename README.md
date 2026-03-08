# Risk & Stability Insights

A healthcare risk analytics and decision-support platform for analyzing patient cohorts using ML-based risk stratification. Built for medical insurers, healthcare administrators, and risk researchers to upload datasets, score members, and derive actionable insights for pricing, retention, fairness compliance, and cost management.

**Data Source**: MEPS (Medical Expenditure Panel Survey) CSV files

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, Radix UI (shadcn/ui), Lucide Icons |
| Charts | Recharts |
| Data Handling | Papa Parse (CSV), Zod (validation) |
| State | React Context + localStorage |
| Routing | React Router v6 |
| Backend | FastAPI (deployed on Render) |

---

## Features

### Upload & Validate
CSV uploader with schema validation against required model features. Tracks data quality (missing columns, coerced values). Supports **Research Mode** (schema-only) and **Production Mode** (full scoring via API).

### Overview Dashboard
KPIs (total members, low-risk rate, average score, model version), model quality metrics (Brier score, AUC), and four interactive charts: risk score distribution, segment donut, feature coverage, and cost distribution. Includes a narrative "Story Mode" panel.

### Model Scoring
Batch scoring results locked to the deployed model. Threshold-based (p >= 0.7) or top-30% rank classification. Export scored datasets.

### Segmentation Explorer
Divides cohort into 4 risk-quantile segments (Q1-Q4). Scatter plot (risk vs cost), summary table per segment, and drill-down into top feature drivers.

### Low-Risk Profile
Contrasts low-risk vs standard-risk members across ~8 key features (age, chronic conditions, distress score, exercise, costs, etc.) with bar charts and detailed metrics.

### Stability & Uncertainty Lab
- **Bootstrap CI**: 200 resamples of low-risk rate (95% confidence interval)
- **Threshold Sensitivity**: Low-risk rate across 7 probability thresholds (0.65-0.75)
- **Calibration Plot**: Predicted vs actual outcome bins

### Pricing & Retention Simulator
Scenario modeling with base premium, admin load, and risk margin inputs. Compares baseline, retention-focus, and margin-focus strategies with 12-month profit projections.

### Fairness & Compliance
Demographic disparity analysis across sex, race/ethnicity, region, and age. Computes per-group low-risk rates, disparity ratios, and identifies largest gaps for policy review.

### Reports & Exports
Centralized export hub for scored datasets, run summaries, segment tables, subgroup metrics, calibration data, and feature coverage. All exports are timestamped.

### Role-Based Access
- **Researcher**: Full access to all pages including upload and scoring
- **Customer**: Curated subset (Overview, Segmentation, Profile, Fairness, Pricing, Reports, Docs)

---

## Data Flow

```
CSV Upload --> Papa Parse --> Schema Validation
                                  |
                    [Research Mode: stop here]
                    [Production Mode: continue]
                                  |
                    Align Features (coerce to numbers)
                                  |
                    Batch Score via API (fallback: local heuristic)
                                  |
                    Compute RunAnalytics (quantiles, correlation,
                    segments, fairness, bootstrap, calibration)
                                  |
                    Store RunState in DataContext + localStorage
                                  |
                    All pages render from single RunState
```

---

## Analytics Engine

All statistical computation happens client-side in TypeScript:

- **Risk distribution**: Mean, median, quantiles (p10/p50/p90), Pearson & Spearman correlation with costs
- **Cost analysis**: Tail concentration (top 10%, top 1%), catastrophic cost rate (>= $20k)
- **Segmentation**: 4 equal-size risk quantiles with per-segment KPIs
- **Fairness**: Subgroup disparity ratios across protected attributes (groups n >= 100)
- **Bootstrap**: 200-resample CI with seeded RNG (seed=42) for reproducibility
- **Calibration**: 10-bin predicted vs actual comparison

Fallback scoring uses a local logistic heuristic when the API is unavailable:
```
rawScore = 1.35 - 0.00009*cost - 0.32*chronic - 0.03*k6 - 0.0008*rx + 0.005*max(50-age, 0)
probability = sigmoid(rawScore)
```

---

## Project Structure

```
src/
├── pages/              # 11 route pages (Overview, Upload, Scoring, etc.)
├── components/
│   ├── dashboard/      # 8 dashboard widgets (charts, tables, panels)
│   ├── layout/         # MainLayout, AppSidebar, TopBar
│   └── ui/             # 30+ Radix-based UI primitives (shadcn/ui)
├── lib/
│   ├── analytics.ts    # Core statistical computations
│   ├── runAnalytics.ts # Pre-computed analytics types
│   ├── narratives.ts   # Human-readable insight generation
│   ├── alignFeatures.ts # Schema validation & coercion
│   └── featureLabels.ts # Display name mapping
├── contexts/
│   ├── DataContext.tsx  # Run state + demo mode
│   └── RoleContext.tsx  # User role & access control
├── services/
│   └── api.ts          # Backend API calls + fallback scoring
├── types/
│   └── model.ts        # TypeScript type definitions
└── data/
    └── demoRunSnapshot.ts # Pre-computed demo bootstrap data
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://risk-stability-insights.onrender.com` |

---

## Key Design Decisions

- **Single RunState**: One active run shared across all pages via React Context — no re-scoring or re-analysis between views
- **Fallback resilience**: Demo CSV fallback if API is down, local scoring heuristic if batch API fails, pre-computed snapshot on first load
- **Caching**: Analytics functions cache results by run ID to avoid recomputation
- **Data quality first**: Every coerced value is tracked, missing columns are flagged, quality diagnostics are surfaced on the Overview
- **Seeded RNG**: Bootstrap uses deterministic seeding for reproducible confidence intervals
- **Client-side math**: All statistics (quantile, correlation, AUC, bootstrap) implemented in TypeScript without external math libraries

---

Built by Veer
