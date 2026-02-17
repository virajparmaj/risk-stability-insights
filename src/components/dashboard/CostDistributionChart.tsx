// src/components/dashboard/CostDistributionChart.tsx

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import { computeRunSummary } from "@/lib/analytics";
import { costDistributionInsights } from "@/lib/narratives";
import { InsightBlock } from "@/components/InsightBlock";

export function CostDistributionChart() {
  const { currentRun } = useData();
  const [logScale, setLogScale] = useState(false);
  const costHistogram = useMemo(
    () => currentRun?.analytics.costDistribution ?? [],
    [currentRun?.analytics.costDistribution]
  );

  const chartData = useMemo(
    () =>
      costHistogram.map((item) => ({
        ...item,
        logCount: Math.log10(item.count + 1),
      })),
    [costHistogram]
  );

  if (!currentRun) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Total Expenditure Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No scored data available
        </CardContent>
      </Card>
    );
  }

  const summary = computeRunSummary(currentRun);
  const insightLines = costDistributionInsights(summary);

  if (!chartData.length || chartData.every((item) => item.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Total Expenditure Distribution
          </CardTitle>
        </CardHeader>
      <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Expenditure fields are not available in this upload
        </CardContent>
        <CardContent className="pt-0">
          <InsightBlock title="Insights" lines={insightLines} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Total Expenditure Distribution
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Current Run
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={logScale ? "default" : "outline"}
            onClick={() => setLogScale((value) => !value)}
          >
            Log Scale
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              exportToCSV(
                chartData.map(({ range, count, logCount }) => ({
                  range,
                  count,
                  log_count: Number(logCount.toFixed(6)),
                })),
                "cost_distribution_current_run.csv"
              )
            }
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />

              <XAxis
                dataKey="range"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
                label={{
                  value: logScale ? "log10(Member Count + 1)" : "Members",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />

              <Tooltip
                formatter={(value: number, _name, payload) => {
                  const row = payload?.payload as { count: number };
                  return [row.count.toLocaleString(), "Members"];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              <Bar
                dataKey={logScale ? "logCount" : "count"}
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                name="Member Count"
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
