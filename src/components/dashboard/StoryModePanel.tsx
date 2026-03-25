// src/components/dashboard/StoryModePanel.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

const methodSummary = [
  {
    title: "Schema alignment",
    content:
      "Required inputs come from the live model card. Missing columns stop scoring before downstream analysis begins.",
  },
  {
    title: "Batch scoring",
    content:
      "The deployed model assigns a low-risk probability to each member. The app does not retrain or modify the model.",
  },
  {
    title: "Shared run context",
    content:
      "Overview, segmentation, fairness, pricing, and exports all read from the same scored run to keep results aligned.",
  },
];

/* ======================================================
   Component
====================================================== */

export function StoryModePanel() {
  const { currentRun } = useData();

  return (
    <Card className="border-border/70 bg-card/70 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Method summary
            </p>
            <CardTitle className="mt-2 text-base font-medium tracking-normal">
              How this run was produced
            </CardTitle>
          </div>

          {currentRun && (
            <Badge variant="outline" className="shrink-0 text-[11px] text-muted-foreground">
              {currentRun.modelCard.version}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {methodSummary.map((item, idx) => (
          <div
            key={item.title}
            className={cn(
              "grid gap-1 border-t border-border/60 pt-3",
              idx === 0 && "border-t-0 pt-0"
            )}
          >
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{item.content}</p>
          </div>
        ))}

        {currentRun && (
          <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            Active model:{" "}
            <span className="font-medium text-foreground">
              {currentRun.modelCard.model_name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
