// src/components/dashboard/StoryModePanel.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Lightbulb,
  UploadCloud,
  BarChart3,
  ShieldCheck,
  Target,
  FlaskConical,
} from "lucide-react";

/* ======================================================
   Narrative blocks (ordered intentionally)
====================================================== */

const story = [
  {
    icon: UploadCloud,
    title: "Upload: Cohort Validation",
    content:
      "Uploaded datasets are not used to retrain the model. Instead, they are validated against the B3_chronic schema and scored to evaluate how a new population distributes across risk segments.",
    tone: "text-primary",
  },
  {
    icon: FlaskConical,
    title: "Minimum Predictive Structure",
    content:
      "B3_chronic represents the minimum feature structure required for stable segmentation. Behavior-only and mental-health-only models were insufficient under bootstrap variability.",
    tone: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Scoring: Probability, Not Labels",
    content:
      "Each member is assigned a probability of belonging to a stable low-risk group. No cost or utilization variables are used at scoring time, preventing outcome leakage.",
    tone: "text-risk-low",
  },
  {
    icon: Target,
    title: "Stability Over Accuracy",
    content:
      "Model selection prioritized segment stability across resamples rather than maximum AUC. Stability emerges once chronic burden indicators are introduced.",
    tone: "text-uncertainty",
  },
  {
    icon: ShieldCheck,
    title: "Deployment & Decision Use",
    content:
      "Predicted low-risk segments enable safer pricing, retention, and benefit design strategies by focusing on upstream health indicators instead of reactive cost signals.",
    tone: "text-chart-2",
  },
];

/* ======================================================
   Component
====================================================== */

export function StoryModePanel() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-uncertainty" />
            Story Mode: From Upload to Stability
          </CardTitle>

          <Badge variant="secondary" className="text-xs">
            B3_chronic · Production
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {story.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className={`shrink-0 mt-0.5 ${item.tone}`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}