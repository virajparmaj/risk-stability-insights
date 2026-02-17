// src/pages/Scoring.tsx

import { useEffect, useState } from "react";
import { fetchModelCard, ModelCard } from "@/services/api";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { exportToCSV } from "@/lib/exportCsv";
import { computeRunSummary, getScoredRows } from "@/lib/analytics";
import { scoringInsights } from "@/lib/narratives";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InsightBlock } from "@/components/InsightBlock";

import {
  Download,
  Lock,
  ShieldCheck,
} from "lucide-react";

const Scoring = () => {
  const { currentRun } = useData();

  const [modelCard, setModelCard] = useState<ModelCard | null>(null);
  const [scoringMethod, setScoringMethod] = useState<"threshold" | "rank">(
    "threshold"
  );

  /* --------------------------------------------------
     Load model metadata (display only)
  -------------------------------------------------- */

  useEffect(() => {
    fetchModelCard()
      .then(setModelCard)
      .catch(() => toast.error("Failed to load model metadata"));
  }, []);

  /* --------------------------------------------------
     Guard: no dataset loaded
  -------------------------------------------------- */

  if (!currentRun) {
    const demoThreshold = 0.7;
    const demoScores = [0.11, 0.22, 0.35, 0.41, 0.52, 0.62, 0.74, 0.81];
    const demoRate =
      demoScores.filter((score) => score >= demoThreshold).length /
      demoScores.length;

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Upload and score data to see insights.
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What-if Demo (No Run Loaded)</CardTitle>
            <CardDescription>
              This is a demo-only preview and not based on uploaded data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Example score count: {demoScores.length}</p>
            <p>
              Example low-risk rate at p ≥ {demoThreshold.toFixed(2)}:{" "}
              {(demoRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scoredRows = getScoredRows(currentRun);
  const { summary } = currentRun;
  const summaryStats = computeRunSummary(currentRun);
  const threshold = currentRun.analytics.threshold;
  const probabilities = scoredRows.map(
    (result) => result.low_risk_probability
  );

  const rankTargetCount = Math.ceil(probabilities.length * 0.3);
  const rankCutoff =
    rankTargetCount > 0
      ? [...probabilities].sort((a, b) => b - a)[rankTargetCount - 1]
      : 0;

  const selectedLowRiskRate =
    scoringMethod === "threshold"
      ? probabilities.filter((value) => value >= threshold).length /
        Math.max(probabilities.length, 1)
      : rankTargetCount / Math.max(probabilities.length, 1);

  const exportScoredDataset = () => {
    if (
      currentRun.sourceRows &&
      currentRun.sourceRows.length === scoredRows.length
    ) {
      const mergedRows = currentRun.sourceRows.map((sourceRow, idx) => ({
        ...Object.fromEntries(
          Object.entries(sourceRow).map(([key, value]) => [key, value ?? ""])
        ),
        low_risk_probability: Number(
          scoredRows[idx].low_risk_probability.toFixed(6)
        ),
        risk_tier: scoredRows[idx].risk_tier,
      })) as Record<string, string | number>[];

      exportToCSV(mergedRows, `${currentRun.datasetName}_scored_dataset.csv`);
      toast.success("Exported scored dataset with source columns");
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
    toast.success("Exported scores-only dataset");
  };
  const insightLines = scoringInsights(
    summaryStats,
    selectedLowRiskRate,
    scoringMethod
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Scoring Results</h1>
        <p className="text-muted-foreground mt-1">
          Scores are low-risk probabilities from the deployed model
        </p>

        <Badge variant="outline" className="mt-2">
          Dataset loaded: {summary.n_members.toLocaleString()} members
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Scoring Configuration
            </CardTitle>
            <CardDescription>
              Production model locked
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-3 bg-risk-low/10 border border-risk-low/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-risk-low" />
                <span className="text-sm font-medium">
                  {modelCard?.model_name ?? "B3_chronic"} (Production)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                low_risk_model_B3_chronic_xgb.joblib
              </p>
              <Badge variant="outline" className="mt-2 text-xs">
                {modelCard?.required_features?.length ?? "—"} features
              </Badge>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Scoring Method</Label>
              <RadioGroup
                value={scoringMethod}
                onValueChange={(v) =>
                  setScoringMethod(v as "threshold" | "rank")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="threshold" id="threshold" />
                  <Label htmlFor="threshold">
                    Count as low-risk when p ≥ {threshold.toFixed(2)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rank" id="rank" />
                  <Label htmlFor="rank">Top 30% by score</Label>
                </div>
              </RadioGroup>
            </div>

            <Button className="w-full" disabled>
              Batch scoring already completed
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Scoring Result</CardTitle>
            <CardDescription>
              Aggregated MEPS batch inference
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Members scored</p>
              <p className="text-lg font-semibold">
                {summary.n_members.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Mean low-risk probability
              </p>
              <p className="text-lg font-semibold">
                {summary.mean_probability.toFixed(3)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                {scoringMethod === "threshold"
                  ? `Low-risk rate (p ≥ ${threshold.toFixed(2)})`
                  : `Selected rate (Top 30%, cutoff ${rankCutoff.toFixed(3)})`}
              </p>
              <p className="text-lg font-semibold">
                {(selectedLowRiskRate * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>

          <CardContent className="pt-0">
            <InsightBlock title="Insights" lines={insightLines} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          className="gap-2"
          onClick={exportScoredDataset}
        >
          <Download className="h-4 w-4" />
          Export Scored Dataset
        </Button>
      </div>
    </div>
  );
};

export default Scoring;
