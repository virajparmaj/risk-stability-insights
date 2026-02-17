// src/components/dashboard/StoryModePanel.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";

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
      "Your uploaded file is checked for the required columns and then scored. It does not retrain the model.",
    tone: "text-primary",
  },
  {
    icon: FlaskConical,
    title: "Live Model Schema",
    content:
      "The exact input fields come from the backend model card, so validation matches the deployed model.",
    tone: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Scoring Output",
    content:
      "Each member gets a low-risk probability. We summarize those scores into rates and segments.",
    tone: "text-risk-low",
  },
  {
    icon: Target,
    title: "Data Quality",
    content:
      "Missing columns block scoring. Blank or invalid values are counted and shown as data quality warnings.",
    tone: "text-uncertainty",
  },
  {
    icon: ShieldCheck,
    title: "Deployment & Decision Use",
    content:
      "All pages read from the same scored run, so exports and charts stay consistent.",
    tone: "text-chart-2",
  },
];

/* ======================================================
   Component
====================================================== */

export function StoryModePanel() {
  const { currentRun } = useData();

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-uncertainty" />
            Story Mode: From Upload to Stability
          </CardTitle>

          <Badge variant="secondary" className="text-xs">
            {currentRun?.modelCard?.model_name ?? "Model"} ·{" "}
            {currentRun?.modelCard?.version ?? "Active"}
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
