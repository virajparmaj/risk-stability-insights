import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, AlertTriangle, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import { computeRunSummary, computeFairnessGroupStats } from "@/lib/analytics";
import { fairnessInsights } from "@/lib/narratives";
import { InsightBlock } from "@/components/InsightBlock";

const FAIRNESS_FIELDS = ["SEX", "RACETHX", "REGION", "AGE"];

const Fairness = () => {
  const { currentRun } = useData();

  const summary = useMemo(
    () => (currentRun ? computeRunSummary(currentRun) : null),
    [currentRun]
  );

  const availableFields = useMemo(() => {
    if (!currentRun) return [];

    const sourceColumns = new Set(
      currentRun.sourceRows?.length ? Object.keys(currentRun.sourceRows[0]) : []
    );
    const alignedColumns = new Set(
      currentRun.alignedRows?.length ? Object.keys(currentRun.alignedRows[0]) : []
    );

    return FAIRNESS_FIELDS.filter((field) => {
      if (field === "AGE") {
        return (
          sourceColumns.has("AGE") ||
          sourceColumns.has("AGELAST") ||
          alignedColumns.has("AGE") ||
          alignedColumns.has("AGELAST")
        );
      }
      return sourceColumns.has(field) || alignedColumns.has(field);
    });
  }, [currentRun]);

  const subgroupStats = useMemo(() => {
    if (!currentRun || !availableFields.length) return [];
    return computeFairnessGroupStats(currentRun, availableFields);
  }, [availableFields, currentRun]);

  const subgroupPerformance = useMemo(
    () => [...subgroupStats].sort((a, b) => b.n - a.n),
    [subgroupStats]
  );

  const overallLowRiskRate = summary?.lowRiskRate ?? 0;
  const disparityValues = subgroupPerformance.map(
    (row) => row.lowRiskRate / Math.max(overallLowRiskRate, 1e-9)
  );

  const minDisparity = disparityValues.length
    ? Math.min(...disparityValues)
    : null;
  const maxDisparity = disparityValues.length
    ? Math.max(...disparityValues)
    : null;

  const chartData = subgroupPerformance.slice(0, 8).map((row) => ({
    group: `${row.field}:${row.group}`,
    predicted: Number(row.lowRiskRate.toFixed(4)),
    actual:
      row.actualLowRiskRate !== null
        ? Number(row.actualLowRiskRate.toFixed(4))
        : null,
  }));

  const insightLines =
    summary && subgroupPerformance.length
      ? fairnessInsights(subgroupPerformance, summary.lowRiskRate)
      : [];

  if (!currentRun || !summary) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Upload and score data to see insights.
      </div>
    );
  }

  if (!availableFields.length) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Fairness & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Group-level diagnostics for current run predictions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Fairness analysis unavailable (missing features).
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subgroupPerformance.length) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Fairness & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Group-level diagnostics for current run predictions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Fairness analysis unavailable (insufficient subgroup size after filtering).
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Fairness & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            Subgroup performance from current run predictions
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportToCSV(
              subgroupPerformance.map((row) => {
                const disparity =
                  row.lowRiskRate / Math.max(overallLowRiskRate, 1e-9);
                return {
                  field: row.field,
                  group: row.group,
                  n: row.n,
                  predicted_low_risk_rate: Number(row.lowRiskRate.toFixed(6)),
                  mean_risk: Number(row.meanRisk.toFixed(6)),
                  mean_cost: Number(row.meanCost.toFixed(2)),
                  actual_low_risk_rate:
                    row.actualLowRiskRate !== null
                      ? Number(row.actualLowRiskRate.toFixed(6))
                      : "",
                  disparity: Number(disparity.toFixed(6)),
                };
              }),
              `${currentRun.datasetName}_fairness_subgroups.csv`
            )
          }
        >
          <Download className="h-4 w-4" />
          Export Fairness Table
        </Button>
      </div>

      <InsightBlock title="Insights" lines={insightLines} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Subgroups Reviewed</p>
            <p className="text-2xl font-bold mt-1">{subgroupPerformance.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Min Disparity</p>
            <p className="text-2xl font-bold mt-1">
              {minDisparity !== null ? minDisparity.toFixed(2) : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">vs overall rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Max Disparity</p>
            <p className="text-2xl font-bold mt-1">
              {maxDisparity !== null ? maxDisparity.toFixed(2) : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">vs overall rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ground Truth Label</p>
            <div className="mt-2">
              <Badge
                variant="outline"
                className={
                  summary.labelsAvailable
                    ? "bg-risk-low/10 text-risk-low border-risk-low/30"
                    : "bg-uncertainty/10 text-uncertainty border-uncertainty/30"
                }
              >
                {summary.labelsAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Predicted vs Actual by Group</CardTitle>
          <CardDescription>
            Actual bars shown only when LOW_RISK label is available in upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="group"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
                />
                <RechartsTooltip
                  formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
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
          <CardTitle className="text-base">Subgroup Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">N</TableHead>
                <TableHead className="text-right">Predicted Rate</TableHead>
                <TableHead className="text-right">Mean Risk</TableHead>
                <TableHead className="text-right">Mean Cost</TableHead>
                <TableHead className="text-right">Actual Rate</TableHead>
                <TableHead className="text-right">Disparity</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subgroupPerformance.map((row) => {
                const disparity =
                  row.lowRiskRate / Math.max(overallLowRiskRate, 1e-9);
                const statusOk = disparity >= 0.8 && disparity <= 1.25;

                return (
                  <TableRow key={`${row.field}:${row.group}`}>
                    <TableCell>{`${row.field}: ${row.group}`}</TableCell>
                    <TableCell className="text-right">{row.n.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {(row.lowRiskRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">{row.meanRisk.toFixed(3)}</TableCell>
                    <TableCell className="text-right">
                      ${Math.round(row.meanCost).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.actualLowRiskRate !== null
                        ? `${(row.actualLowRiskRate * 100).toFixed(2)}%`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">{disparity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          statusOk
                            ? "bg-risk-low/10 text-risk-low border-risk-low/30"
                            : "bg-uncertainty/10 text-uncertainty border-uncertainty/30"
                        }
                      >
                        {statusOk ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Review
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fairness;
