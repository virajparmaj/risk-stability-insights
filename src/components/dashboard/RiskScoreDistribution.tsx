import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Generate smooth density curve data
const densityData = Array.from({ length: 50 }, (_, i) => {
  const x = i * 2;
  // Bimodal distribution simulation
  const peak1 = 800 * Math.exp(-Math.pow((x - 20) / 12, 2));
  const peak2 = 400 * Math.exp(-Math.pow((x - 65) / 18, 2));
  return {
    score: x,
    density: Math.round(peak1 + peak2 + Math.random() * 20)
  };
});

export function RiskScoreDistribution() {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Risk Score Distribution</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={densityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--risk-low))" />
                  <stop offset="50%" stopColor="hsl(var(--risk-medium))" />
                  <stop offset="100%" stopColor="hsl(var(--risk-high))" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="score" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Risk Score', position: 'insideBottom', offset: -5, fontSize: 11 }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Density', angle: -90, position: 'insideLeft', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine 
                x={30} 
                stroke="hsl(var(--risk-low))" 
                strokeDasharray="5 5" 
                label={{ value: 'Low-Risk Threshold', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="density" 
                stroke="url(#riskGradient)"
                fill="url(#riskGradient)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
