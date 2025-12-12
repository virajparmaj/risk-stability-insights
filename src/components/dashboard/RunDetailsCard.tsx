import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { CheckCircle, GitBranch, Layers, Calendar } from 'lucide-react';

export function RunDetailsCard() {
  const { currentRun } = useData();

  if (!currentRun) return null;

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Last Run Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span>Model Version</span>
          </div>
          <span className="text-sm font-mono font-medium">{currentRun.modelVersion}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>Feature Set</span>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {currentRun.featureSet}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Training Date</span>
          </div>
          <span className="text-sm">Nov 15, 2024</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Calibration</span>
          </div>
          <Badge variant="default" className="text-xs bg-risk-low text-risk-low-foreground">
            Calibrated
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
