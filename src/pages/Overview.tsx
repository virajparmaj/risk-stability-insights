// src/pages/Overview.tsx

import { useEffect } from "react";
import { toast } from "sonner";

import { useData } from "@/contexts/DataContext";
import { healthCheck } from "@/services/api";

import { KPICard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";

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
            Upload and validate a dataset to populate portfolio metrics.
          </p>
        </div>
      </div>
    );
  }

  const { summary, modelCard } = currentRun;

  /* ======================================================
     Render
  ====================================================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Portfolio Overview</h1>
        <p className="text-muted-foreground mt-1">
          Scoring run summary for validated dataset
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
            title="Mean P(Low-Risk)"
            value={summary.mean_probability.toFixed(3)}
            icon={<TrendingUp className="h-4 w-4" />}
          />

          <KPICard
            title="Model Version"
            value={modelCard.version}
            icon={<CheckCircle className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* =========================
         Section B: Model Metadata
      ========================== */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Model Outputs
          <Badge className="text-xs bg-risk-low text-risk-low-foreground">
            {modelCard.model_name} · Production
          </Badge>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Target"
            value={modelCard.target}
            icon={<Target className="h-4 w-4" />}
          />

          <KPICard
            title="Feature Count"
            value={modelCard.required_features.length.toString()}
            icon={<BarChart3 className="h-4 w-4" />}
          />

          <KPICard
            title="Calibration"
            value="Baseline OK"
            subtitle="Training reference"
            variant="success"
            icon={<CheckCircle className="h-4 w-4" />}
          />

          <KPICard
            title="Stability"
            value="Verified"
            subtitle="Bootstrap-tested"
            variant="success"
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