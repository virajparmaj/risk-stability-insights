import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, AlertTriangle, BarChart3, DollarSign, FlaskConical } from 'lucide-react';

const insights = [
  {
    icon: FlaskConical,
    title: 'Minimum Predictive Structure',
    content: 'Minimum predictive structure used: B3_chronic. This feature block achieves stable segmentation with behavior + mental health + functional + chronic burden features.',
    color: 'text-primary'
  },
  {
    icon: Users,
    title: 'Low-Risk Profile',
    content: 'Low-risk members are characterized by bottom 30% TOTEXP23, zero ER visits (ERTOT23=0), and zero inpatient stays (IPDIS23=0). These label-defining variables are NOT used as predictors.',
    color: 'text-risk-low'
  },
  {
    icon: BarChart3,
    title: 'Model Performance',
    content: 'Behavior-only (B0) was insufficient for stability. Stability emerges after adding chronic burden features (B3). AUC baseline ≈ 0.77 with consistent bootstrap results.',
    color: 'text-primary'
  },
  {
    icon: AlertTriangle,
    title: 'Research Insight',
    content: 'Utilization models (B5) are more accurate but not used in production due to outcome-proximity. B5 uses non-label utilization variables that are too close to the outcome definition.',
    color: 'text-uncertainty'
  },
  {
    icon: DollarSign,
    title: 'Pricing Recommendation',
    content: 'Segment-specific pricing for predicted low-risk members could improve loss ratio stability while enabling targeted retention programs based on behavioral and mental health indicators.',
    color: 'text-chart-2'
  }
];

export function StoryModePanel() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-uncertainty" />
            Story Mode: Key Insights
          </CardTitle>
          <Badge variant="secondary" className="text-xs">B3_chronic Production</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-3">
            <div className={`shrink-0 mt-0.5 ${insight.color}`}>
              <insight.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{insight.content}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
