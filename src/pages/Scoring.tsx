// src/pages/Scoring.tsx

import { useEffect, useState } from "react";
import { fetchModelCard } from "@/services/api";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { useData } from "@/contexts/DataContext";

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

import {
  Download,
  Lock,
  ShieldCheck,
} from "lucide-react";

const Scoring = () => {
  const { role, mode } = useRole();
  const { currentRun } = useData();

  const [modelCard, setModelCard] = useState<any>(null);
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
    return (
      <div className="py-20 text-center text-muted-foreground">
        No scored dataset available.
        <br />
        Upload and validate MEPS data first.
      </div>
    );
  }

  const { summary } = currentRun;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Model Scoring (Production)</h1>
        <p className="text-muted-foreground mt-1">
          Run {modelCard?.model_name ?? "B3_chronic"} XGBoost model
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
                  <Label htmlFor="threshold">Threshold (p ≥ 0.7)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rank" id="rank" />
                  <Label htmlFor="rank">Lowest-risk 30%</Label>
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
                Low-risk rate (p ≥ 0.7)
              </p>
              <p className="text-lg font-semibold">
                {(summary.low_risk_rate * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Scored Dataset
        </Button>
      </div>
    </div>
  );
};

export default Scoring;