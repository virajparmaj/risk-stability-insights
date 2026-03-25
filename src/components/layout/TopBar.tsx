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
  const { currentRun, isDemoRefreshing } = useData();
  const { role, setRole, mode, setMode } = useRole();
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, string> = {
    researcher: "Researcher",
    customer: "Customer",
  };

  return (
    <header className="border-b border-border/70 bg-background/95 px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {mode === "production" ? (
              <Badge className="gap-1.5 border border-risk-low/20 bg-risk-low/10 text-risk-low hover:bg-risk-low/10">
                <ShieldCheck className="h-3 w-3" />
                Production Mode
              </Badge>
            ) : (
              <Badge className="gap-1.5 border border-uncertainty/30 bg-uncertainty/10 text-uncertainty hover:bg-uncertainty/10">
                <FlaskConical className="h-3 w-3" />
                Research Benchmark
              </Badge>
            )}

            {role !== "customer" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() =>
                  setMode(mode === "production" ? "research" : "production")
                }
              >
                Switch
              </Button>
            )}
          </div>

          {currentRun ? (
            <div className="mt-2 min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Database className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{currentRun.datasetName}</span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{currentRun.summary.n_members.toLocaleString()} members</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(currentRun.timestamp), "MMM d, yyyy · HH:mm")}
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  Model {currentRun.modelCard.version}
                </span>
                {isDemoRefreshing && <span>Refreshing demo data</span>}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">
              {isDemoRefreshing ? "Refreshing demo data" : "No scored run loaded"}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border/70 bg-card px-2.5 py-1.5">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
            >
              <SelectTrigger className="h-auto w-[148px] border-0 bg-transparent px-0 py-0 text-sm shadow-none focus:ring-0">
                <SelectValue placeholder={roleLabels[role]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="researcher">Researcher</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="default"
            size="sm"
            className="gap-2 shadow-none"
            onClick={() => navigate("/reports")}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Report</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
