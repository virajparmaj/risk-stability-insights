import { KPICard } from '@/components/ui/kpi-card';
import { CostDistributionChart } from '@/components/dashboard/CostDistributionChart';
import { SegmentDonutChart } from '@/components/dashboard/SegmentDonutChart';
import { RiskScoreDistribution } from '@/components/dashboard/RiskScoreDistribution';
import { FeatureImportanceChart } from '@/components/dashboard/FeatureImportanceChart';
import { StoryModePanel } from '@/components/dashboard/StoryModePanel';
import { RunDetailsCard } from '@/components/dashboard/RunDetailsCard';
import { Users, DollarSign, ShieldCheck, AlertTriangle, BarChart3, Target, Database, Percent } from 'lucide-react';

const Overview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Portfolio Overview</h1>
        <p className="text-muted-foreground mt-1">Risk segmentation and low-risk stability summary</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <KPICard
          title="Total Members"
          value="12,847"
          tooltip="Total number of members in the current dataset"
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="Avg TOTEXP"
          value="$8,234"
          subtitle="Per member/year"
          tooltip="Average total healthcare expenditure per member"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
          trendValue="+3.2%"
        />
        <KPICard
          title="Median TOTEXP"
          value="$3,421"
          subtitle="Per member/year"
          tooltip="Median total healthcare expenditure"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Low-Risk %"
          value="42.3%"
          subtitle="5,432 members"
          tooltip="Percentage of members classified as low-risk based on current model"
          variant="success"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <KPICard
          title="Catastrophic Rate"
          value="7.5%"
          subtitle=">$20k threshold"
          tooltip="Percentage of members with expenditure exceeding catastrophic threshold"
          variant="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <KPICard
          title="Stability Score"
          value="0.847"
          subtitle="Target: >0.80"
          tooltip="Profit stability score based on cost variance in low-risk segment"
          variant="success"
          icon={<Target className="h-4 w-4" />}
        />
        <KPICard
          title="Model AUC"
          value="0.891"
          tooltip="Area Under ROC Curve for the current classification model"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <KPICard
          title="Data Quality"
          value="94.2%"
          tooltip="Overall data completeness and validity score"
          icon={<Database className="h-4 w-4" />}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostDistributionChart />
        <SegmentDonutChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskScoreDistribution />
        <FeatureImportanceChart />
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
