import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import {
  computeRunSummary,
  computeBootstrapLowRiskRateCI,
  computeThresholdSensitivity,
} from "@/lib/analytics";
import { riskLabInsights } from "@/lib/narratives";
import { InsightBlock } from "@/components/InsightBlock";

const RiskLab = () => {
  const { currentRun } = useData();

  if (!currentRun) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Upload and score data to see insights.
      </div>
    );
  }

  const summary = computeRunSummary(currentRun);
  const quality = currentRun.analytics.modelQuality;
  const calibration = currentRun.analytics.calibration;
  const ci = computeBootstrapLowRiskRateCI(currentRun, 200, 42);
  const sensitivity = computeThresholdSensitivity(currentRun);
  const insightLines = riskLabInsights(summary, ci, sensitivity);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Stability & Uncertainty Lab
          </h1>
          <p className="text-muted-foreground mt-1">
            Current run calibration and threshold sensitivity diagnostics
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportToCSV(
              calibration.map((row) => ({
                bucket: row.bucket,
                n: row.n,
                predicted: Number(row.predicted.toFixed(6)),
                actual: row.actual !== null ? Number(row.actual.toFixed(6)) : "",
              })),
              `${currentRun.datasetName}_calibration_bins.csv`
            )
          }
        >
          <Download className="h-4 w-4" />
          Export Calibration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Predicted Rate</p>
            <p className="text-2xl font-bold mt-1">
              {(summary.lowRiskRate * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">95% Bootstrap CI</p>
            <p className="text-lg font-bold mt-1">
              {(ci.lower * 100).toFixed(2)}% - {(ci.upper * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">AUC</p>
            <p className="text-2xl font-bold mt-1">
              {quality.auc !== null ? quality.auc.toFixed(3) : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Brier Score</p>
            <p className="text-2xl font-bold mt-1">
              {quality.brier !== null ? quality.brier.toFixed(3) : "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ground Truth Label</p>
            <div className="mt-2">
              <Badge
                variant="outline"
                className={
                  quality.hasGroundTruthLabel
                    ? "bg-risk-low/10 text-risk-low border-risk-low/30"
                    : "bg-uncertainty/10 text-uncertainty border-uncertainty/30"
                }
              >
                {quality.hasGroundTruthLabel ? "Available" : "Missing"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calibration by Probability Bin</CardTitle>
            <CardDescription>
              Predicted vs actual low-risk rate per score bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calibration}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 1]}
                    tickFormatter={(value) => `${Math.round(value * 100)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  />
                  <Bar dataKey="predicted" fill="hsl(var(--chart-1))" name="Predicted" />
                  <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Threshold Sensitivity</CardTitle>
            <CardDescription>
              Low-risk rate response to threshold perturbation (0.65-0.75)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="threshold"
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0.65, 0.75]}
                    tickFormatter={(value) => Number(value).toFixed(2)}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                    labelFormatter={(value) => `Threshold ${Number(value).toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowRiskRate"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Low-Risk Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <InsightBlock title="Insights" lines={insightLines} />
    </div>
  );
};

export default RiskLab;
