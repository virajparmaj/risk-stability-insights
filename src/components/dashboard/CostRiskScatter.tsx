// src/components/dashboard/CostRiskScatter.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

/* ======================================================
   Types
====================================================== */

interface CostRiskPoint {
  id: number;
  risk: number;
  cost: number;
}

/* ======================================================
   Component
====================================================== */

export function CostRiskScatter({ rows }: { rows: CostRiskPoint[] }) {
  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost vs Risk</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No scored data available
        </CardContent>
      </Card>
    );
  }

  const points = rows.map((r) => ({
    ...r,
    tier: r.risk >= 0.7 ? "Low" : "Standard",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Cost vs Risk Distribution
        </CardTitle>
      </CardHeader>

      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey="risk"
              domain={[0, 1]}
              tickFormatter={(v) => v.toFixed(2)}
              label={{
                value: "Predicted Low-Risk Probability",
                position: "bottom",
                offset: 6,
              }}
            />

            <YAxis
              type="number"
              dataKey="cost"
              tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              label={{
                value: "Annual Cost",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip
              formatter={(value: number, name: string) =>
                name === "cost"
                  ? [`$${value.toLocaleString()}`, "Cost"]
                  : [value.toFixed(3), "Risk"]
              }
            />

            <Scatter data={points}>
              {points.map((p, idx) => (
                <Cell
                  key={idx}
                  fill={
                    p.tier === "Low"
                      ? "hsl(var(--risk-low))"
                      : "hsl(var(--risk-medium))"
                  }
                  fillOpacity={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}