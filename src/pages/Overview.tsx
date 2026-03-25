// src/pages/Overview.tsx

import { useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { useData } from "@/contexts/DataContext";
import { healthCheck } from "@/services/api";
import { computeRunSummary } from "@/lib/analytics";
import { overviewInsights } from "@/lib/narratives";

import { KPICard } from "@/components/ui/kpi-card";
import { InsightBlock } from "@/components/InsightBlock";

import {
  CostDistributionChart,
  SegmentDonutChart,
  RiskScoreDistribution,
  FeatureImportanceChart,
  StoryModePanel,
} from "@/components/dashboard";

import { EmptyState } from "@/components/EmptyState";

import {
  Users,
  ShieldCheck,
  BarChart3,
  Target,
  Database,
  TrendingUp,
  CheckCircle,
  LayoutDashboard,
  Clock,
  GitBranch,
  Layers,
} from "lucide-react";

const Overview = () => {
  const { currentRun } = useData();

  /* ======================================================
     Backend health check (silent)
  ====================================================== */
  useEffect(() => {
    healthCheck().catch(() => {
      toast.error("Backend not reachable");
    });
  }, []);

  /* ======================================================
     Empty state — no validated run yet
  ====================================================== */
  if (!currentRun) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Portfolio Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            No dataset has been validated yet
          </p>
        </div>

        <EmptyState
          icon={LayoutDashboard}
          title="No scored data yet"
          description="Upload a MEPS CSV to generate your portfolio overview."
          action={{ label: "Go to Upload", href: "/upload" }}
        />
      </div>
    );
  }

  const { summary, modelCard } = currentRun;
  const quality = currentRun.analytics.modelQuality;
  const summaryStats = computeRunSummary(currentRun);
  const overviewLines = overviewInsights(summaryStats).slice(0, 3);
  const replacementRate =
    currentRun.dataQuality.rowCount > 0
      ? currentRun.dataQuality.replacedValueCount /
        (currentRun.dataQuality.rowCount *
          currentRun.dataQuality.requiredFeatureCount)
      : 0;
  const runFacts = [
    {
      label: "Model",
      value: modelCard.model_name,
      icon: Layers,
    },
    {
      label: "Version",
      value: modelCard.version,
      icon: GitBranch,
    },
    {
      label: "Run time",
      value: format(new Date(currentRun.timestamp), "MMM d, yyyy · HH:mm"),
      icon: Clock,
    },
    {
      label: "Input fields",
      value: modelCard.required_features.length.toString(),
      icon: BarChart3,
    },
    {
      label: "Predicted outcome",
      value: "Low-Risk Probability",
      icon: Target,
    },
    {
      label: "Average score",
      value: summary.mean_probability.toFixed(3),
      icon: TrendingUp,
    },
  ];

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Operational overview
            </p>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Run overview
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Assess run health, low-risk opportunity, and whether this upload
                is ready for deeper analysis.
              </p>
            </div>
          </div>

          <InsightBlock
            title="What to check first"
            lines={overviewLines}
            className="border-border bg-card/70"
          />
        </div>

        <div className="rounded-xl border border-border/70 bg-card/70 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Run facts
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {runFacts.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid gap-1 border-t border-border/60 pt-3 first:border-t-0 first:pt-0"
              >
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </dt>
                <dd className="text-sm font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Database className="h-4 w-4 text-muted-foreground" />
          Run health
        </div>

        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          <KPICard
            title="Total Members"
            value={summary.n_members.toLocaleString()}
            icon={<Users className="h-4 w-4" />}
          />

          <KPICard
            title="Low-Risk Rate"
            value={`${(summary.low_risk_rate * 100).toFixed(1)}%`}
            variant="success"
            icon={<ShieldCheck className="h-4 w-4" />}
          />

          <KPICard
            title="Score Accuracy"
            value={
              quality.brier !== null
                ? `Brier ${quality.brier.toFixed(3)}`
                : "Label Unavailable"
            }
            subtitle={
              quality.hasGroundTruthLabel
                ? `AUC ${quality.auc?.toFixed(3) ?? "N/A"}`
                : "No LOW_RISK label in upload"
            }
            variant={quality.hasGroundTruthLabel ? "success" : "warning"}
            icon={<CheckCircle className="h-4 w-4" />}
          />

          <KPICard
            title="Data Quality"
            value={`${(replacementRate * 100).toFixed(2)}% coerced`}
            subtitle={`${currentRun.dataQuality.replacedValueCount.toLocaleString()} values set to 0`}
            variant={replacementRate < 0.01 ? "success" : "warning"}
            icon={<Target className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Primary analysis
          </p>
          <h2 className="text-base font-medium text-foreground">
            Distribution and segment split
          </h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <RiskScoreDistribution
            hideInsights
            className="border-border/70 bg-card shadow-none"
          />
          <SegmentDonutChart
            hideInsights
            className="border-border/70 bg-card shadow-none"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <StoryModePanel />

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Secondary analysis
            </p>
            <h2 className="text-base font-medium text-foreground">
              Coverage and cost context
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Use these supporting views after the top-line readout to validate
              input completeness and downstream expenditure spread.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <FeatureImportanceChart
              hideInsights
              className="border-border/70 bg-card/70 shadow-none"
            />
            <CostDistributionChart
              hideInsights
              className="border-border/70 bg-card/70 shadow-none"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Overview;
