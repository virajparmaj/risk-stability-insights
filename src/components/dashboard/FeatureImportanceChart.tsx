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
  Cell,
} from "recharts";

import { getFeatureLabel, getFeatureLabelWithCode } from "@/lib/featureLabels";

/* ======================================================
   B3_chronic global feature importance
   (training-time, non-SHAP)
====================================================== */

const featureData = [
  { code: "DIABDX_M18", importance: 0.148, block: "Chronic" },
  { code: "HIBPDX", importance: 0.132, block: "Chronic" },
  { code: "K6SUM42", importance: 0.118, block: "Mental Health" },
  { code: "PHQ242", importance: 0.104, block: "Mental Health" },
  { code: "MNHLTH53", importance: 0.097, block: "Mental Health" },
  { code: "RTHLTH53", importance: 0.089, block: "Mental Health" },
  { code: "WLKLIM53", importance: 0.075, block: "Functional" },
  { code: "ACTLIM53", importance: 0.069, block: "Functional" },
  { code: "SOCLIM53", importance: 0.061, block: "Functional" },
  { code: "COGLIM53", importance: 0.054, block: "Functional" },
  { code: "PHYEXE53", importance: 0.031, block: "Behavior" },
  { code: "OFTSMK53", importance: 0.022, block: "Behavior" },
];

/* ======================================================
   Block color mapping
====================================================== */

const BLOCK_COLOR: Record<string, string> = {
  "Chronic": "hsl(var(--risk-high))",
  "Mental Health": "hsl(var(--chart-3))",
  "Functional": "hsl(var(--chart-4))",
  "Behavior": "hsl(var(--risk-low))",
};

/* ======================================================
   Component
====================================================== */

export function FeatureImportanceChart() {
  const maxImportance = Math.max(
    ...featureData.map((f) => f.importance)
  );

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Feature Importance (B3_chronic)
          </CardTitle>

          <Badge variant="outline" className="text-xs">
            Training-Time
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Global feature importance from model training. These values
                reflect relative contribution to predictions and are not
                instance-level explanations.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                domain={[0, maxImportance * 1.1]}
                tickFormatter={(v) => v.toFixed(2)}
                label={{
                  value: "Relative Importance",
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
                formatter={(value: number, _name, props: any) => [
                  value.toFixed(3),
                  `${props.payload.block} feature`,
                ]}
                labelFormatter={(code) => getFeatureLabelWithCode(code)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {featureData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BLOCK_COLOR[entry.block]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Importance values are normalized training-time metrics. No cost or
          utilization variables are used.
        </p>
      </CardContent>
    </Card>
  );
}