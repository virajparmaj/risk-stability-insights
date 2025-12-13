import { KPICard } from '@/components/ui/kpi-card';
import { CostDistributionChart } from '@/components/dashboard/CostDistributionChart';
import { SegmentDonutChart } from '@/components/dashboard/SegmentDonutChart';
import { RiskScoreDistribution } from '@/components/dashboard/RiskScoreDistribution';
import { FeatureImportanceChart } from '@/components/dashboard/FeatureImportanceChart';
import { StoryModePanel } from '@/components/dashboard/StoryModePanel';
import { RunDetailsCard } from '@/components/dashboard/RunDetailsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, ShieldCheck, AlertTriangle, BarChart3, Target, Database, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

const Overview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Portfolio Overview</h1>
        <p className="text-muted-foreground mt-1">MEPS HC-251 (2023) risk segmentation and low-risk stability summary</p>
      </div>

      {/* Section A: Descriptive Portfolio Stats */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Descriptive Portfolio Statistics
          <Badge variant="outline" className="text-xs">Not Model Inputs</Badge>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Total Members"
            value="12,847"
            tooltip="Total DUPERSID count in current dataset (MEPS HC-251 2023)"
            icon={<Users className="h-4 w-4" />}
          />
          <KPICard
            title="Median TOTEXP23"
            value="$3,421"
            subtitle="Descriptive only"
            tooltip="Median total healthcare expenditure - descriptive statistic, not a model input"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <KPICard
            title="CATA_10K Rate"
            value="12.3%"
            subtitle=">$10,000 threshold"
            tooltip="Percentage of members with TOTEXP23 exceeding $10,000 - descriptive"
            variant="warning"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <KPICard
            title="CATA_20K Rate"
            value="7.5%"
            subtitle=">$20,000 threshold"
            tooltip="Percentage of members with TOTEXP23 exceeding $20,000 - descriptive"
            variant="danger"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Section B: Model Outputs */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Model Outputs
          <Badge variant="default" className="text-xs bg-risk-low text-risk-low-foreground">B3_chronic Production</Badge>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="% Predicted Low-Risk"
            value="32.1%"
            subtitle="4,124 members (p≥0.7)"
            tooltip="Percentage of members classified as low-risk by B3_chronic model at p≥0.7 threshold"
            variant="success"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <KPICard
            title="Mean P(Low-Risk)"
            value="0.423"
            tooltip="Average predicted probability of low-risk across all members"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <KPICard
            title="Calibration Status"
            value="PASS"
            subtitle="Brier: 0.142"
            tooltip="Model calibration assessment - Brier score indicates good calibration"
            variant="success"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <KPICard
            title="Stability Score"
            value="0.847"
            subtitle="AUC SD: 0.018 | Size SD: 2.1%"
            tooltip="Bootstrap stability metrics - low variance indicates stable predictions"
            variant="success"
            icon={<Target className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskScoreDistribution />
        <SegmentDonutChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureImportanceChart />
        <CostDistributionChart />
      </div>

      {/* Story Mode and Run Details */}
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
