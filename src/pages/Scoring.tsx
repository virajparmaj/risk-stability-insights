// src/pages/Scoring.tsx
import { useEffect, useState } from "react";
import { scoreMember, fetchModelCard } from "@/services/api";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";

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
  Play,
  Download,
  Lock,
  ShieldCheck,
} from "lucide-react";

const Scoring = () => {
  const { role, mode } = useRole();

  const [modelCard, setModelCard] = useState<any>(null);
  const [scoringMethod, setScoringMethod] = useState<"threshold" | "rank">(
    "threshold"
  );
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<{
    low_risk_probability: number;
    risk_tier: string;
  } | null>(null);

  // --------------------------------------------------
  // Load model metadata
  // --------------------------------------------------

  useEffect(() => {
    fetchModelCard()
      .then(setModelCard)
      .catch(() => toast.error("Failed to load model metadata"));
  }, []);

  // --------------------------------------------------
  // Score single member (demo / what-if)
  // --------------------------------------------------

  const handleScore = async () => {
    setIsScoring(true);
    setResult(null);

    try {
      // 🔹 B3_chronic-compatible demo payload
      const payload = {
        data: {
          PHYEXE53: 2,
          OFTSMK53: 0,
          RTHLTH53: 2,
          MNHLTH53: 2,
          K6SUM42: 4,
          PHQ242: 1,
          WLKLIM53: 0,
          ACTLIM53: 0,
          SOCLIM53: 0,
          COGLIM53: 0,
          DIABDX_M18: 0,
          HIBPDX: 1,
        },
      };

      const res = await scoreMember(payload);
      setResult(res);

    } catch (e: any) {
      toast.error(e.message || "Scoring failed");
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Model Scoring (Production)</h1>
        <p className="text-muted-foreground mt-1">
          Run {modelCard?.model_name ?? "B3_chronic"} XGBoost model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
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
                {modelCard?.required_features?.length ?? 12} features
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

            <Button
              className="w-full gap-2"
              onClick={handleScore}
              disabled={isScoring}
            >
              {isScoring ? "Scoring…" : (
                <>
                  <Play className="h-4 w-4" />
                  Score Member
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Scoring Result</CardTitle>
            <CardDescription>Live backend inference</CardDescription>
          </CardHeader>

          <CardContent>
            {result ? (
              <div className="space-y-2">
                <p>
                  <strong>Low-risk probability:</strong>{" "}
                  {result.low_risk_probability.toFixed(3)}
                </p>
                <p>
                  <strong>Risk tier:</strong>{" "}
                  <Badge>{result.risk_tier}</Badge>
                </p>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                Run scoring to see results
              </div>
            )}
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