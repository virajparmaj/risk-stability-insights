// src/pages/Overview.tsx

import { useEffect } from "react";
import { toast } from "sonner";

import { useData } from "@/contexts/DataContext";
import { healthCheck } from "@/services/api";
import { computeRunSummary } from "@/lib/analytics";
import { overviewInsights } from "@/lib/narratives";

import { KPICard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { InsightBlock } from "@/components/InsightBlock";

import {
  CostDistributionChart,
  SegmentDonutChart,
  RiskScoreDistribution,
  FeatureImportanceChart,
  StoryModePanel,
  RunDetailsCard,
} from "@/components/dashboard";

import {
  Users,
  ShieldCheck,
  BarChart3,
  Target,
  Database,
  TrendingUp,
  CheckCircle,
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio Overview</h1>
          <p className="text-muted-foreground mt-1">
            No dataset has been validated yet
          </p>
        </div>

        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p className="text-sm">
            Upload and score data to see insights.
          </p>
        </div>
      </div>
    );
  }

  const { summary, modelCard } = currentRun;
  const quality = currentRun.analytics.modelQuality;
  const summaryStats = computeRunSummary(currentRun);
  const overviewLines = overviewInsights(summaryStats);
  const replacementRate =
    currentRun.dataQuality.rowCount > 0
      ? currentRun.dataQuality.replacedValueCount /
        (currentRun.dataQuality.rowCount *
          currentRun.dataQuality.requiredFeatureCount)
      : 0;

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Run Overview</h1>
        <p className="text-muted-foreground mt-1">
          Summary of your latest scored upload
        </p>
      </div>

      {/* =========================
         Section A: Dataset Summary
      ========================== */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Dataset Summary
          <Badge variant="outline" className="text-xs">
            Current Run
          </Badge>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            title="Average Low-Risk Score"
            value={summary.mean_probability.toFixed(3)}
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <KPICard
            title="Model Version"
            value={modelCard.version}
            icon={<CheckCircle className="h-4 w-4" />}
          />
        </div>

        <div className="mt-3">
          <InsightBlock title="Insights" lines={overviewLines} />
        </div>
      </div>

      {/* =========================
         Section B: Model Metadata
      ========================== */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Model Summary
          <Badge className="text-xs bg-risk-low text-risk-low-foreground">
            {modelCard.model_name} · Production
          </Badge>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Predicted Outcome"
            value="Low-Risk Probability"
            icon={<Target className="h-4 w-4" />}
          />

          <KPICard
            title="Input Fields Used"
            value={modelCard.required_features.length.toString()}
            icon={<BarChart3 className="h-4 w-4" />}
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
      </div>

      {/* =========================
         Charts
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskScoreDistribution />
        <SegmentDonutChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureImportanceChart />
        <CostDistributionChart />
      </div>

      {/* =========================
         Narrative + Run Metadata
      ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StoryModePanel />
        </div>
        <RunDetailsCard />
      </div>
    </div>
  );
};

export default Overview;
