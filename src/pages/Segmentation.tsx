import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import {
  computeRunSummary,
  getRunPoints,
  computeSegmentDrivers,
  type SegmentQuantileSummary,
} from "@/lib/analytics";
import { segmentationInsights } from "@/lib/narratives";
import { getFeatureLabel } from "@/lib/featureLabels";
import { InsightBlock } from "@/components/InsightBlock";
import { CostRiskScatter } from "@/components/dashboard/CostRiskScatter";
import {
  SegmentSummaryTable,
  type SegmentSummary,
} from "@/components/dashboard/SegmentSummaryTable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const SEGMENT_COLORS = [
  "hsl(var(--risk-low))",
  "hsl(var(--chart-4))",
  "hsl(var(--risk-medium))",
  "hsl(var(--risk-high))",
];

const Segmentation = () => {
  const { currentRun } = useData();
  const [selectedSegment, setSelectedSegment] =
    useState<SegmentQuantileSummary | null>(null);

  const summary = useMemo(
    () => (currentRun ? computeRunSummary(currentRun) : null),
    [currentRun]
  );

  const segments = useMemo(() => summary?.segments ?? [], [summary]);
  const threshold = summary?.threshold ?? 0.7;

  const segmentRows: SegmentSummary[] = useMemo(
    () =>
      segments.map((segment) => ({
        id: segment.id,
        name: segment.name,
        size: segment.size,
        pct: Number((segment.share * 100).toFixed(1)),
        meanCost: Number(segment.meanCost.toFixed(0)),
        variance: Number(segment.costVariance.toFixed(0)),
        catastrophicRate: Number((segment.catastrophicRate * 100).toFixed(2)),
        avgRiskScore: Number(segment.meanRisk.toFixed(3)),
      })),
    [segments]
  );

  const scatterData = useMemo(() => {
    if (!currentRun || !segments.length) return [];

    const points = getRunPoints(currentRun);
    const maxPoints = 1800;
    const step = Math.max(1, Math.ceil(points.length / maxPoints));

    return points
      .filter((_, idx) => idx % step === 0)
      .map((point, idx) => {
        let segmentIndex = segments.findIndex(
          (segment) => point.risk <= segment.maxRisk
        );
        if (segmentIndex < 0) segmentIndex = segments.length - 1;
        if (segmentIndex < 0) segmentIndex = 0;

        return {
          id: idx,
          risk: point.risk,
          cost: point.cost,
          segment: segments[segmentIndex]?.name ?? "Other",
          color: SEGMENT_COLORS[segmentIndex % SEGMENT_COLORS.length],
        };
      });
  }, [currentRun, segments]);

  const overviewLines = useMemo(() => {
    if (!summary) return [];
    return segmentationInsights(segments, summary);
  }, [segments, summary]);

  const scatterLines = useMemo(() => {
    if (!summary || !segments.length) return [];

    const highestCost = [...segments].sort((a, b) => b.meanCost - a.meanCost)[0];
    const lowestRisk = [...segments].sort((a, b) => a.meanRisk - b.meanRisk)[0];

    return [
      `Scatter plots ${scatterData.length.toLocaleString()} sampled members from ${summary.nMembers.toLocaleString()} total to keep rendering fast.`,
      `${highestCost.name} has highest mean cost ($${Math.round(highestCost.meanCost).toLocaleString()}); ${lowestRisk.name} has lowest mean risk (${lowestRisk.meanRisk.toFixed(3)}).`,
      `Overall catastrophic cost rate is ${(summary.catastrophicRate * 100).toFixed(2)}% with threshold p >= ${summary.threshold.toFixed(2)}.`,
    ];
  }, [scatterData.length, segments, summary]);

  const selectedSegmentDrivers = useMemo(() => {
    if (!currentRun || !selectedSegment) return [];
    return computeSegmentDrivers(currentRun, selectedSegment.name, 3);
  }, [currentRun, selectedSegment]);

  const selectedSegmentLines = useMemo(() => {
    if (!summary || !selectedSegment) return [];

    const lines = [
      `${selectedSegment.name} mean risk is ${selectedSegment.meanRisk.toFixed(3)} vs overall ${summary.meanRisk.toFixed(3)} (${(selectedSegment.meanRisk - summary.meanRisk).toFixed(3)} delta).`,
      `${selectedSegment.name} mean cost is $${Math.round(selectedSegment.meanCost).toLocaleString()} vs overall $${Math.round(summary.meanCost).toLocaleString()} (${Math.round(selectedSegment.meanCost - summary.meanCost).toLocaleString()} delta).`,
      `${selectedSegment.name} catastrophic rate is ${(selectedSegment.catastrophicRate * 100).toFixed(2)}% vs overall ${(summary.catastrophicRate * 100).toFixed(2)}%.`,
    ];

    if (selectedSegmentDrivers.length) {
      lines.push(
        `Top feature contrasts: ${selectedSegmentDrivers
          .map(
            (driver) =>
              `${getFeatureLabel(driver.feature)} (${driver.delta >= 0 ? "+" : ""}${driver.delta.toFixed(3)})`
          )
          .join(", ")}.`
      );
    } else {
      lines.push(
        "Driver-level contrasts are unavailable because aligned feature rows are not present for this run."
      );
    }

    return lines.slice(0, 6);
  }, [selectedSegment, selectedSegmentDrivers, summary]);

  const tableInsightLines = useMemo(() => {
    if (!segmentRows.length) return [];
    const pctValues = segmentRows.map((row) => row.pct);
    const catastrophicValues = segmentRows.map((row) => row.catastrophicRate);

    return [
      `Each segment is sized by risk quartiles, so expected share is near 25% per segment (observed range ${Math.min(...pctValues).toFixed(1)}%-${Math.max(...pctValues).toFixed(1)}%).`,
      `Highest catastrophic segment rate is ${Math.max(...catastrophicValues).toFixed(2)}% and lowest is ${Math.min(...catastrophicValues).toFixed(2)}%.`,
    ];
  }, [segmentRows]);

  if (!currentRun || !summary) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Upload and score data to see insights.
      </div>
    );
  }

  const highestCostSegment = segments.length
    ? [...segments].sort((a, b) => b.meanCost - a.meanCost)[0]
    : null;
  const lowestRiskSegment = segments.length
    ? [...segments].sort((a, b) => a.meanRisk - b.meanRisk)[0]
    : null;

  const segmentBarData = segments.map((segment, idx) => ({
    name: segment.name,
    members: segment.size,
    color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Segmentation Explorer
          </h1>
          <p className="text-muted-foreground mt-1">
            Quantile-based cohort segments from current run probabilities
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportToCSV(
              segments.map((segment) => ({
                segment: segment.name,
                count: segment.size,
                percent: Number((segment.share * 100).toFixed(2)),
                min_probability: Number(segment.minRisk.toFixed(6)),
                max_probability: Number(segment.maxRisk.toFixed(6)),
                mean_probability: Number(segment.meanRisk.toFixed(6)),
                mean_cost: Number(segment.meanCost.toFixed(2)),
                catastrophic_rate: Number((segment.catastrophicRate * 100).toFixed(4)),
              })),
              `${currentRun.datasetName}_segments.csv`
            )
          }
        >
          <Download className="h-4 w-4" />
          Export Segments
        </Button>
      </div>

      <InsightBlock title="Insights" lines={overviewLines} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {segments.map((segment, idx) => (
          <Card key={segment.name}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{segment.name}</p>
                  <p className="text-2xl font-bold mt-1">
                    {(segment.share * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {segment.size.toLocaleString()} members
                  </p>
                </div>
                <Badge variant="outline" style={{ borderColor: SEGMENT_COLORS[idx] }}>
                  {segment.minRisk.toFixed(2)}-{segment.maxRisk.toFixed(2)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CostRiskScatter
        rows={scatterData}
        threshold={threshold}
        insights={scatterLines}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segment Table</CardTitle>
          <CardDescription>
            Click a row to open detail comparisons for that segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SegmentSummaryTable
            segments={segmentRows}
            selectedSegmentId={selectedSegment?.id}
            onSelect={(segmentRow) => {
              const segment =
                segments.find((entry) => entry.id === segmentRow.id) ?? null;
              setSelectedSegment(segment);
            }}
          />
          <div className="mt-3">
            <InsightBlock title="Table Insights" lines={tableInsightLines} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segment Size Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentBarData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), "Members"]}
                />
                <Bar dataKey="members" radius={[4, 4, 0, 0]}>
                  {segmentBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3">
            <InsightBlock
              title="Segment Extremes"
              lines={[
                `Highest mean cost segment is ${highestCostSegment?.name ?? "N/A"} (${highestCostSegment ? `$${Math.round(highestCostSegment.meanCost).toLocaleString()}` : "N/A"}).`,
                `Lowest mean risk segment is ${lowestRiskSegment?.name ?? "N/A"} (${lowestRiskSegment?.meanRisk.toFixed(3) ?? "N/A"}).`,
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={Boolean(selectedSegment)}
        onOpenChange={(open) => {
          if (!open) setSelectedSegment(null);
        }}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedSegment?.name ?? "Segment"} Detail</SheetTitle>
            <SheetDescription>
              Computed comparison against the overall cohort
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {selectedSegment ? (
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-lg font-semibold">
                      {selectedSegment.size.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">Risk Range</p>
                    <p className="text-lg font-semibold">
                      {selectedSegment.minRisk.toFixed(2)}-{selectedSegment.maxRisk.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <InsightBlock
              title="What Distinguishes This Segment"
              lines={selectedSegmentLines}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Segmentation;
