import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileArchive,
  Clock,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import { computeRunSummary, getScoredRows } from "@/lib/analytics";
import { reportsExecutiveSummary } from "@/lib/narratives";
import { InsightBlock } from "@/components/InsightBlock";

const Reports = () => {
  const { currentRun } = useData();

  if (!currentRun) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        Upload and score data to see insights.
      </div>
    );
  }

  const scoredRows = getScoredRows(currentRun);
  const summary = computeRunSummary(currentRun);
  const generatedAt = new Date(currentRun.timestamp).toLocaleString();
  const executiveLines = reportsExecutiveSummary(summary, summary.segments);

  const exportScoredDataset = () => {
    if (
      currentRun.sourceRows &&
      currentRun.sourceRows.length === scoredRows.length
    ) {
      exportToCSV(
        currentRun.sourceRows.map((sourceRow, idx) => ({
          ...Object.fromEntries(
            Object.entries(sourceRow).map(([key, value]) => [key, value ?? ""])
          ),
          low_risk_probability: Number(
            scoredRows[idx].low_risk_probability.toFixed(6)
          ),
          risk_tier: scoredRows[idx].risk_tier,
        })),
        `${currentRun.datasetName}_scored_dataset.csv`
      );
      return;
    }

    exportToCSV(
      scoredRows.map((row, idx) => ({
        member_index: idx + 1,
        low_risk_probability: Number(row.low_risk_probability.toFixed(6)),
        risk_tier: row.risk_tier,
      })),
      `${currentRun.datasetName}_scores_only.csv`
    );
  };

  const exportSummary = () => {
    exportToCSV(
      [
        {
          dataset_name: currentRun.datasetName,
          run_timestamp: currentRun.timestamp,
          model_name: currentRun.modelCard.model_name,
          model_version: currentRun.modelCard.version,
          n_members: summary.nMembers,
          low_risk_threshold: Number(summary.threshold.toFixed(4)),
          mean_probability: Number(summary.meanRisk.toFixed(6)),
          median_probability: Number(summary.medianRisk.toFixed(6)),
          low_risk_rate: Number(summary.lowRiskRate.toFixed(6)),
          risk_p10: Number(summary.riskQuantiles.p10.toFixed(6)),
          risk_p90: Number(summary.riskQuantiles.p90.toFixed(6)),
          cost_p50: Number(summary.costQuantiles.p50.toFixed(2)),
          cost_p90: Number(summary.costQuantiles.p90.toFixed(2)),
          top10_cost_share: Number(summary.tailShares.top10MemberCostShare.toFixed(6)),
          replaced_values: currentRun.dataQuality.replacedValueCount,
        },
      ],
      `${currentRun.datasetName}_run_summary.csv`
    );
  };

  const exportCalibration = () => {
    exportToCSV(
      currentRun.analytics.calibration.map((row) => ({
        bucket: row.bucket,
        n: row.n,
        predicted: Number(row.predicted.toFixed(6)),
        actual: row.actual !== null ? Number(row.actual.toFixed(6)) : "",
      })),
      `${currentRun.datasetName}_calibration.csv`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">
          Export artifacts generated from the current scored run
        </p>
      </div>

      <InsightBlock title="Executive Summary" lines={executiveLines} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Run Snapshot</CardTitle>
          <CardDescription>
            {currentRun.modelCard.model_name} · {currentRun.modelCard.version}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Dataset</p>
            <p className="font-medium mt-1">{currentRun.datasetName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Members</p>
            <p className="font-medium mt-1">{summary.nMembers.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Low-Risk Rate</p>
            <p className="font-medium mt-1">{(summary.lowRiskRate * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Generated</p>
            <p className="font-medium mt-1">{generatedAt}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Scored Dataset
            </CardTitle>
            <CardDescription>
              Source rows plus low-risk probability and risk tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" onClick={exportScoredDataset}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Run Summary
            </CardTitle>
            <CardDescription>
              Model metadata, run metrics, and validation counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" onClick={exportSummary}>
              <Download className="h-4 w-4" />
              Export Summary
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Calibration Bins
            </CardTitle>
            <CardDescription>
              Predicted vs actual rates by probability buckets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" onClick={exportCalibration}>
              <Download className="h-4 w-4" />
              Export Calibration
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Checklist</CardTitle>
          <CardDescription>Data lineage for governance review</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Source filename captured</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {currentRun.sourceFilename ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{currentRun.sourceFilename ?? "Not available"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Model card attached</TableCell>
                <TableCell>
                  <Badge variant="outline">Yes</Badge>
                </TableCell>
                <TableCell>
                  {currentRun.modelCard.model_name} · {currentRun.modelCard.version}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Validation diagnostics</TableCell>
                <TableCell>
                  <Badge variant="outline">Yes</Badge>
                </TableCell>
                <TableCell>
                  {currentRun.dataQuality.replacedValueCount.toLocaleString()} coerced values
                  across {currentRun.dataQuality.rowCount.toLocaleString()} rows
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Run timestamp</TableCell>
                <TableCell>
                  <Badge variant="outline">Yes</Badge>
                </TableCell>
                <TableCell className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {generatedAt}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
