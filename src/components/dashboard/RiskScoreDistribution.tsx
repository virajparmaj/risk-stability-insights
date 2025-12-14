// src/components/dashboard/RiskScoreDistribution.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useData } from "@/contexts/DataContext";

/* ======================================================
   Helpers
====================================================== */

interface HistogramBin {
  score: number;   // probability bucket midpoint (%)
  count: number;  // number of members
}

function buildHistogram(
  probs: number[],
  bins: number = 20
): HistogramBin[] {
  const counts = Array(bins).fill(0);

  probs.forEach((p) => {
    const idx = Math.min(Math.floor(p * bins), bins - 1);
    counts[idx]++;
  });

  return counts.map((count, i) => ({
    score: Math.round(((i + 0.5) / bins) * 100),
    count,
  }));
}

/* ======================================================
   Component
====================================================== */

export function RiskScoreDistribution() {
  const { currentRun } = useData();

  if (!currentRun || currentRun.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Risk Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No scoring results available
        </CardContent>
      </Card>
    );
  }

  const probabilities = currentRun.results.map(
    (r) => r.low_risk_probability
  );

  const histogram = buildHistogram(probabilities);

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Risk Score Distribution
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={histogram}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--risk-low))" />
                  <stop offset="50%" stopColor="hsl(var(--risk-medium))" />
                  <stop offset="100%" stopColor="hsl(var(--risk-high))" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

              <XAxis
                dataKey="score"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Predicted Low-Risk Probability (%)",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Members",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />

              <Tooltip
                formatter={(v: number) => [`${v}`, "Members"]}
                labelFormatter={(l) => `${l}% probability`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              {/* B3 low-risk threshold */}
              <ReferenceLine
                x={70}
                stroke="hsl(var(--risk-low))"
                strokeDasharray="5 5"
                label={{
                  value: "Low-Risk Threshold (p ≥ 0.7)",
                  fontSize: 10,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#riskGradient)"
                fill="url(#riskGradient)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}