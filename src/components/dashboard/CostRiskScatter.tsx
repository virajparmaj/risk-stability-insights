// src/components/dashboard/CostRiskScatter.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InsightBlock } from "@/components/InsightBlock";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CostRiskPoint {
  id: number;
  risk: number;
  cost: number;
  segment?: string;
  color?: string;
}

interface Props {
  rows: CostRiskPoint[];
  threshold?: number;
  insights?: string[];
}

export function CostRiskScatter({
  rows,
  threshold = 0.7,
  insights = [],
}: Props) {
  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk vs Cost Scatter</CardTitle>
          <CardDescription>
            X: predicted low-risk score, Y: log10(cost + 1)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Upload and score data to see insights.
        </CardContent>
      </Card>
    );
  }

  const points = rows.map((row) => ({
    ...row,
    probabilityPct: Number((row.risk * 100).toFixed(2)),
    logCost: Number(Math.log10(Math.max(row.cost, 0) + 1).toFixed(4)),
    color:
      row.color ??
      (row.risk >= threshold
        ? "hsl(var(--risk-high))"
        : "hsl(var(--risk-low))"),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Risk vs Cost Scatter</CardTitle>
        <CardDescription>
          X: predicted low-risk score (%), Y: log10(TOTEXP + 1)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />

              <XAxis
                type="number"
                dataKey="probabilityPct"
                domain={[0, 100]}
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
                type="number"
                dataKey="logCost"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "log10(Cost + 1)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />

              <Tooltip
                formatter={(value: number, name: string, payload) => {
                  if (name === "probabilityPct") return [`${value.toFixed(2)}%`, "Score"];
                  if (name === "logCost") return [value.toFixed(3), "log10(Cost + 1)"];
                  const row = payload?.payload as { cost?: number };
                  return [
                    row?.cost !== undefined ? `$${Math.round(row.cost).toLocaleString()}` : "N/A",
                    "Cost",
                  ];
                }}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { segment?: string } | undefined;
                  return row?.segment ? `Segment: ${row.segment}` : "Member";
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              <Scatter data={points}>
                {points.map((point) => (
                  <Cell key={point.id} fill={point.color} fillOpacity={0.65} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Threshold reference: p &gt;= {threshold.toFixed(2)}
        </p>

        <div className="mt-3">
          <InsightBlock title="Insights" lines={insights} />
        </div>
      </CardContent>
    </Card>
  );
}
