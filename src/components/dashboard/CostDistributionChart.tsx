import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const histogramData = [
  { range: '$0-1k', count: 4521, logCount: 3654 },
  { range: '$1k-2k', count: 2847, logCount: 2847 },
  { range: '$2k-5k', count: 2156, logCount: 2156 },
  { range: '$5k-10k', count: 1523, logCount: 1856 },
  { range: '$10k-20k', count: 987, logCount: 1423 },
  { range: '$20k-50k', count: 534, logCount: 1187 },
  { range: '$50k-100k', count: 198, logCount: 823 },
  { range: '$100k+', count: 81, logCount: 541 },
];

export function CostDistributionChart() {
  const [logScale, setLogScale] = useState(false);

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Total Expenditure Distribution</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={logScale ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLogScale(!logScale)}
          >
            Log Scale
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Members']}
              />
              <Legend />
              <Bar 
                dataKey={logScale ? 'logCount' : 'count'} 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
                name="Member Count"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
