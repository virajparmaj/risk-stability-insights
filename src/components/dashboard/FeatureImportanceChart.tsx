// src/components/dashboard/FeatureImportanceChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { getFeatureLabel, getFeatureLabelWithCode } from "@/lib/featureLabels";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import { computeRunSummary } from "@/lib/analytics";
import { InsightBlock } from "@/components/InsightBlock";

interface CoverageTooltipPayload {
  payload: {
    std: number;
  };
}

export function FeatureImportanceChart() {
  const { currentRun } = useData();

  if (!currentRun || !currentRun.analytics.featureCoverage.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Feature Coverage (Current Run)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No feature coverage data available
        </CardContent>
      </Card>
    );
  }

  const featureData = currentRun.analytics.featureCoverage
    .slice(0, 12)
    .sort((a, b) => b.nonZeroRate - a.nonZeroRate)
    .map((row) => ({
      code: row.code,
      nonZeroRatePct: Number((row.nonZeroRate * 100).toFixed(2)),
      mean: Number(row.mean.toFixed(4)),
      std: Number(row.std.toFixed(4)),
    }));
  const summary = computeRunSummary(currentRun);
  const topFeature = featureData[0];
  const medianCoverage =
    featureData.length > 0
      ? featureData
          .map((row) => row.nonZeroRatePct)
          .sort((a, b) => a - b)[Math.floor(featureData.length / 2)]
      : 0;
  const insightLines = [
    `Top covered feature is ${getFeatureLabel(topFeature.code)} at ${topFeature.nonZeroRatePct.toFixed(1)}% non-zero coverage.`,
    `Median non-zero coverage across displayed features is ${medianCoverage.toFixed(1)}%.`,
    `${summary.missingness.totalCoerced.toLocaleString()} values were coerced during alignment (${(summary.missingness.coercedRate * 100).toFixed(2)}% of required cells).`,
  ];

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Feature Coverage (Current Run)
          </CardTitle>

          <Badge variant="outline" className="text-xs">
            Top 12 by Non-Zero Rate
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
            This shows which fields are filled in your upload. It is not model importance.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            exportToCSV(
              currentRun.analytics.featureCoverage.map((row) => ({
                feature_code: row.code,
                non_zero_rate: Number(row.nonZeroRate.toFixed(6)),
                mean: Number(row.mean.toFixed(6)),
                std: Number(row.std.toFixed(6)),
              })),
              "feature_coverage_current_run.csv"
            )
          }
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 90, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal
                vertical={false}
                className="stroke-border"
              />

              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                label={{
                  value: "Non-Zero Coverage (%)",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />

              <YAxis
                dataKey="code"
                type="category"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={130}
                tickFormatter={(code) => getFeatureLabel(code)}
              />

              <RechartsTooltip
                formatter={(
                  value: number,
                  _name,
                  props: CoverageTooltipPayload
                ) => [
                  `${value.toFixed(2)}%`,
                  `${props.payload.std.toFixed(4)} std`,
                ]}
                labelFormatter={(code) => getFeatureLabelWithCode(code)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              <Bar
                dataKey="nonZeroRatePct"
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--chart-3))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3">
          <InsightBlock title="Insights" lines={insightLines} />
        </div>
      </CardContent>
    </Card>
  );
}
