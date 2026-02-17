// src/components/dashboard/SegmentDonutChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import { computeRunSummary } from "@/lib/analytics";
import { InsightBlock } from "@/components/InsightBlock";

/* ======================================================
   Types
====================================================== */

interface SegmentDatum {
  name: string;
  count: number;
  percent: number;
  color: string;
}

interface SegmentTooltipPayload {
  payload: SegmentDatum;
}

/* ======================================================
   Component
====================================================== */

export function SegmentDonutChart() {
  const { currentRun } = useData();

  if (!currentRun || currentRun.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Risk Segment Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No segmentation results available
        </CardContent>
      </Card>
    );
  }

  const total = currentRun.results.length;

  const threshold = currentRun.analytics.threshold;

  const lowRiskCount = currentRun.results.filter(
    (r) => r.low_risk_probability >= threshold
  ).length;

  const standardRiskCount = total - lowRiskCount;

  const segmentData: SegmentDatum[] = [
    {
      name: "Low Risk",
      count: lowRiskCount,
      percent: +(100 * (lowRiskCount / total)).toFixed(1),
      color: "hsl(var(--risk-low))",
    },
    {
      name: "Standard Risk",
      count: standardRiskCount,
      percent: +(100 * (standardRiskCount / total)).toFixed(1),
      color: "hsl(var(--risk-medium))",
    },
  ];
  const summary = computeRunSummary(currentRun);
  const insightLines = [
    `At threshold p ≥ ${threshold.toFixed(2)}, ${lowRiskCount.toLocaleString()} of ${total.toLocaleString()} members are low-risk (${(100 * summary.lowRiskRate).toFixed(2)}%).`,
    `Standard-risk members make up ${(100 * (1 - summary.lowRiskRate)).toFixed(2)}% of the cohort.`,
    `If selection broadens to top 10% by score, the threshold would move below ${summary.riskQuantiles.p90.toFixed(3)}.`,
  ];

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Low-Risk vs Standard Split
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            exportToCSV(
              segmentData.map((row) => ({
                segment: row.name,
                members: row.count,
                percent: row.percent,
                threshold_used: threshold,
              })),
              "segment_distribution_current_run.csv"
            )
          }
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="percent"
                nameKey="name"
                label={({ percent }) => `${percent}%`}
                labelLine={false}
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(
                  value: number,
                  name: string,
                  props: SegmentTooltipPayload
                ) => [
                  `${value}% (${props.payload.count.toLocaleString()} members)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3">
          <InsightBlock title="Insights" lines={insightLines} />
        </div>
      </CardContent>
    </Card>
  );
}
