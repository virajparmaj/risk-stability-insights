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
import { getFeatureLabel } from "@/lib/featureLabels";
import { computeRunSummary, computeProfileContrasts } from "@/lib/analytics";
import { lowRiskProfileInsights } from "@/lib/narratives";
import { InsightBlock } from "@/components/InsightBlock";

const PROFILE_FEATURES = [
  "OBTOTV23",
  "OPTOTV23",
  "RXTOT23",
  "EMPST53",
  "MARRY53X",
  "EDUCYR",
  "K6SUM42",
  "PHQ242",
  "TOTEXP23",
];

const LowRiskProfile = () => {
  const { currentRun } = useData();

  const summary = useMemo(
    () => (currentRun ? computeRunSummary(currentRun) : null),
    [currentRun]
  );

  const profileRows = useMemo(() => {
    if (!currentRun) return [];
    return computeProfileContrasts(currentRun, PROFILE_FEATURES);
  }, [currentRun]);

  const chartRows = useMemo(
    () =>
      profileRows.slice(0, 8).map((row) => ({
        feature: row.feature,
        label: getFeatureLabel(row.feature),
        lowRisk: Number(row.lowRiskMean.toFixed(3)),
        standardRisk: Number(row.restMean.toFixed(3)),
      })),
    [profileRows]
  );

  const insightLines = useMemo(() => {
    if (!summary) return [];
    return lowRiskProfileInsights(profileRows, summary);
  }, [profileRows, summary]);

  if (!currentRun || !summary) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Upload and score data to see insights.
      </div>
    );
  }

  const standardCount = summary.nMembers - summary.lowRiskCount;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Low-Risk Member Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Computed cohort contrasts for low-risk vs remaining members
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportToCSV(
              profileRows.map((row) => ({
                feature: row.feature,
                feature_label: getFeatureLabel(row.feature),
                low_risk_mean: Number(row.lowRiskMean.toFixed(6)),
                standard_mean: Number(row.restMean.toFixed(6)),
                delta: Number(row.delta.toFixed(6)),
              })),
              `${currentRun.datasetName}_low_risk_profile.csv`
            )
          }
        >
          <Download className="h-4 w-4" />
          Export Profile
        </Button>
      </div>

      <InsightBlock title="Insights" lines={insightLines} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Threshold</p>
            <p className="text-2xl font-bold mt-1">p &gt;= {summary.threshold.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Low-Risk Members</p>
            <p className="text-2xl font-bold mt-1">
              {summary.lowRiskCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(summary.lowRiskRate * 100).toFixed(2)}% of cohort
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Standard Members</p>
            <p className="text-2xl font-bold mt-1">
              {standardCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {((1 - summary.lowRiskRate) * 100).toFixed(2)}% of cohort
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mean Comparison</CardTitle>
          <CardDescription>
            Low-risk vs standard-risk averages for selected indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartRows.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Upload and score data to see insights.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="feature"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    labelFormatter={(feature) =>
                      `${getFeatureLabel(String(feature))} (${String(feature)})`
                    }
                  />
                  <Bar dataKey="lowRisk" fill="hsl(var(--risk-low))" name="Low Risk" />
                  <Bar
                    dataKey="standardRisk"
                    fill="hsl(var(--risk-medium))"
                    name="Standard"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {profileRows.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Upload and score data to see insights.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Low-Risk Mean</TableHead>
                  <TableHead className="text-right">Standard Mean</TableHead>
                  <TableHead className="text-right">Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profileRows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell>
                      {getFeatureLabel(row.feature)}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {row.feature}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.lowRiskMean.toFixed(3)}</TableCell>
                    <TableCell className="text-right">{row.restMean.toFixed(3)}</TableCell>
                    <TableCell className="text-right">{row.delta.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LowRiskProfile;
