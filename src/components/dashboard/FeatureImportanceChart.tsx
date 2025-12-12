import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const featureData = [
  { name: 'ERTOT', importance: 0.234, description: 'Emergency room visits total' },
  { name: 'IPDIS', importance: 0.187, description: 'Inpatient discharges' },
  { name: 'TOTEXP_LAG', importance: 0.156, description: 'Prior year total expenditure' },
  { name: 'ADSMOK42', importance: 0.098, description: 'Current smoking status' },
  { name: 'BMINDX53', importance: 0.087, description: 'Body Mass Index' },
  { name: 'DIABDX', importance: 0.076, description: 'Diabetes diagnosis' },
  { name: 'HIBPDX', importance: 0.065, description: 'High blood pressure diagnosis' },
  { name: 'AGE', importance: 0.054, description: 'Age in years' },
];

export function FeatureImportanceChart() {
  const maxImportance = Math.max(...featureData.map(f => f.importance));

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Top Feature Drivers</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">SHAP-based feature importance showing the top predictors of low-risk classification.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={featureData} 
              layout="vertical" 
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border" />
              <XAxis 
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, maxImportance * 1.1]}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <YAxis 
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                width={65}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `Importance: ${value.toFixed(3)}`,
                  props.payload.description
                ]}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {featureData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index < 3 ? 'hsl(var(--primary))' : 'hsl(var(--chart-2))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
