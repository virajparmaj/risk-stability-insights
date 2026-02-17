// src/components/dashboard/RunDetailsCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";

import {
  CheckCircle,
  GitBranch,
  Layers,
  Calendar,
  Users,
} from "lucide-react";

export function RunDetailsCard() {
  const { currentRun } = useData();

  /* --------------------------------------------------
     Empty state
  -------------------------------------------------- */
  if (!currentRun) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Last Run Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No production run available
        </CardContent>
      </Card>
    );
  }

  const { modelCard, timestamp, summary } = currentRun;

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Last Run Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Model */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Model</span>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {modelCard.model_name}
          </Badge>
        </div>

        {/* Version */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span>Version</span>
          </div>
          <span className="text-sm font-mono">
            {modelCard.version}
          </span>
        </div>

        {/* Feature count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Features</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {modelCard.required_features.length}
          </Badge>
        </div>

        {/* Run timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Run Time</span>
          </div>
          <span className="text-sm">
            {format(new Date(timestamp), "MMM d, yyyy · HH:mm")}
          </span>
        </div>

        {/* Members scored */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Members Scored</span>
          </div>
          <span className="text-sm font-medium">
            {summary.n_members.toLocaleString()}
          </span>
        </div>

        {/* Validation replacements */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Coerced Values</span>
          </div>
          <span className="text-sm font-medium">
            {currentRun.dataQuality.replacedValueCount.toLocaleString()}
          </span>
        </div>

        {/* Calibration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Calibration</span>
          </div>
          <Badge className="text-xs bg-risk-low text-risk-low-foreground">
            Training-Calibrated
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
