import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useData } from "@/contexts/DataContext";
import { useRole, UserRole } from "@/contexts/RoleContext";

import {
  FileText,
  Database,
  Clock,
  GitBranch,
  User,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const { currentRun } = useData();
  const { role, setRole, mode, setMode } = useRole();
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, string> = {
    researcher: "Researcher",
    customer: "Customer",
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      {/* LEFT */}
      <div className="flex items-center gap-6">
        {/* Mode badge */}
        <div className="flex items-center gap-2">
          {mode === "production" ? (
            <Badge className="gap-1.5 bg-risk-low text-risk-low-foreground">
              <ShieldCheck className="h-3 w-3" />
              Production Mode
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="gap-1.5 bg-uncertainty/20 text-uncertainty border-uncertainty/30"
            >
              <FlaskConical className="h-3 w-3" />
              Research Benchmark
            </Badge>
          )}

          {role !== "customer" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() =>
                setMode(mode === "production" ? "research" : "production")
              }
            >
              Switch
            </Button>
          )}
        </div>

        {/* Run metadata (SAFE) */}
        {currentRun && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {currentRun.datasetName}
              </span>
              <Badge variant="secondary" className="text-xs">
                {currentRun.summary.n_members.toLocaleString()} members
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(
                  new Date(currentRun.timestamp),
                  "MMM d, yyyy · HH:mm"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>{currentRun.modelCard.version}</span>
            </div>
          </>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Role selector */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Select
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
          >
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue placeholder={roleLabels[role]} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="researcher">Researcher</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Report button */}
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/reports")}
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </header>
  );
}
