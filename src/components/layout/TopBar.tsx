import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { FileText, Database, Clock, GitBranch, User, FlaskConical, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export function TopBar() {
  const { currentRun } = useData();
  const { role, setRole, mode, setMode } = useRole();

  const roleLabels: Record<UserRole, string> = {
    analyst: 'Analyst',
    actuary: 'Actuary / Pricing',
    executive: 'Executive Viewer'
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-6">
        {/* Mode Badge */}
        <div className="flex items-center gap-2">
          {mode === 'production' ? (
            <Badge variant="default" className="gap-1.5 bg-risk-low text-risk-low-foreground">
              <ShieldCheck className="h-3 w-3" />
              Production Mode
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 bg-uncertainty/20 text-uncertainty border-uncertainty/30">
              <FlaskConical className="h-3 w-3" />
              Research Benchmark
            </Badge>
          )}
          {role !== 'executive' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setMode(mode === 'production' ? 'research' : 'production')}
            >
              Switch
            </Button>
          )}
        </div>

        {currentRun && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{currentRun.datasetName}</span>
              <Badge variant="secondary" className="text-xs">
                {currentRun.recordCount.toLocaleString()} records
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(currentRun.runTimestamp, 'MMM d, yyyy HH:mm')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>{currentRun.modelVersion}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="w-[160px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="actuary">Actuary / Pricing</SelectItem>
              <SelectItem value="executive">Executive Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="default" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </header>
  );
}
