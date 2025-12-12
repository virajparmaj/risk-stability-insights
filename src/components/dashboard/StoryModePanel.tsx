import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, AlertTriangle, BarChart3, DollarSign } from 'lucide-react';

const insights = [
  {
    icon: Users,
    title: 'Low-Risk Profile',
    content: 'Low-risk members are characterized by minimal ER utilization (≤1 visit), no inpatient stays, and favorable behavioral indicators (non-smokers, BMI < 30).',
    color: 'text-risk-low'
  },
  {
    icon: BarChart3,
    title: 'Key Drivers',
    content: 'Emergency room visits and prior-year expenditure are the strongest predictors, contributing 42% of model explanatory power.',
    color: 'text-primary'
  },
  {
    icon: AlertTriangle,
    title: 'Risk Concentration',
    content: 'Top 10% of members account for 64% of total expenditure. Catastrophic claims (>$20k) occur in 7.5% of the population.',
    color: 'text-risk-medium'
  },
  {
    icon: Lightbulb,
    title: 'Model Confidence',
    content: 'The reduced behavior-first model achieves AUC 0.847 with 8 features, retaining 94% of full-model performance.',
    color: 'text-info'
  },
  {
    icon: DollarSign,
    title: 'Pricing Insight',
    content: 'Segment-specific pricing could improve loss ratio stability by 12% while maintaining competitive premiums for low-risk members.',
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
          <Badge variant="secondary" className="text-xs">Auto-generated</Badge>
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
