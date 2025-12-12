import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';

const tailRiskData = [
  { percentile: 'Top 1%', share: 28.4, avgCost: 156780, count: 128 },
  { percentile: 'Top 5%', share: 48.2, avgCost: 87430, count: 642 },
  { percentile: 'Top 10%', share: 64.1, avgCost: 52340, count: 1285 },
  { percentile: 'Top 25%', share: 84.3, avgCost: 28760, count: 3212 },
  { percentile: 'Bottom 50%', share: 5.8, avgCost: 1240, count: 6424 },
];

const catastrophicByDecile = [
  { decile: 1, probability: 0.3, cost: 890 },
  { decile: 2, probability: 0.8, cost: 1450 },
  { decile: 3, probability: 1.4, cost: 2100 },
  { decile: 4, probability: 2.8, cost: 3200 },
  { decile: 5, probability: 4.5, cost: 4800 },
  { decile: 6, probability: 7.2, cost: 6900 },
  { decile: 7, probability: 12.4, cost: 9800 },
  { decile: 8, probability: 21.8, cost: 15400 },
  { decile: 9, probability: 38.5, cost: 28900 },
  { decile: 10, probability: 68.2, cost: 78600 },
];

const ablationResults = [
  { feature: 'ERTOT', auc: 0.847, delta: -0.044, keep: true },
  { feature: 'IPDIS', auc: 0.862, delta: -0.029, keep: true },
  { feature: 'TOTEXP_LAG', auc: 0.871, delta: -0.020, keep: true },
  { feature: 'ADSMOK42', auc: 0.881, delta: -0.010, keep: true },
  { feature: 'BMINDX53', auc: 0.885, delta: -0.006, keep: true },
  { feature: 'DIABDX', auc: 0.887, delta: -0.004, keep: true },
  { feature: 'HIBPDX', auc: 0.889, delta: -0.002, keep: true },
  { feature: 'AGE', auc: 0.891, delta: 0.000, keep: false },
];

const bootstrapData = Array.from({ length: 50 }, (_, i) => ({
  iteration: i + 1,
  mean: 1847 + (Math.random() - 0.5) * 300,
  lower: 1650 + (Math.random() - 0.5) * 200,
  upper: 2100 + (Math.random() - 0.5) * 200,
}));

const RiskLab = () => {
  const [threshold, setThreshold] = useState([20000]);

  const varValue = 45230;
  const cvarValue = 67840;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Risk & Volatility Lab</h1>
        <p className="text-muted-foreground mt-1">Tail-risk analysis, uncertainty quantification, and model stability testing</p>
      </div>

      {/* Threshold Control & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Catastrophic Threshold</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold">${threshold[0].toLocaleString()}</span>
            </div>
            <Slider
              value={threshold}
              onValueChange={setThreshold}
              min={10000}
              max={100000}
              step={5000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$10k</span>
              <span>$100k</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Value at Risk (95%)</p>
                <p className="text-2xl font-bold mt-1">${varValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">5% chance of exceeding</p>
              </div>
              <div className="p-2 bg-uncertainty/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-uncertainty" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CVaR / Expected Shortfall</p>
                <p className="text-2xl font-bold mt-1">${cvarValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg loss beyond VaR</p>
              </div>
              <div className="p-2 bg-risk-high/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-risk-high" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Catastrophic Rate</p>
                <p className="text-2xl font-bold mt-1">7.5%</p>
                <p className="text-xs text-muted-foreground mt-1">&gt;${threshold[0].toLocaleString()} threshold</p>
              </div>
              <Badge variant="outline" className="bg-risk-high/10 text-risk-high border-risk-high/30">
                965 members
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tail Risk & Probability Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tail Risk Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Tail Risk Concentration</CardTitle>
              <CardDescription>Expenditure share by population percentile</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Percentile</TableHead>
                  <TableHead className="text-right">Cost Share</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tailRiskData.map((row) => (
                  <TableRow key={row.percentile}>
                    <TableCell className="font-medium">{row.percentile}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-risk-high"
                            style={{ width: `${row.share}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm">{row.share}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">${row.avgCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Catastrophic Probability by Decile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Catastrophic Probability by Risk Decile</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catastrophicByDecile} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="decile" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Risk Decile', position: 'bottom', fontSize: 11 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'P(Catastrophic) %', angle: -90, position: 'left', fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Probability']}
                  />
                  <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                    {catastrophicByDecile.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.probability < 5 
                            ? 'hsl(var(--risk-low))' 
                            : entry.probability < 20 
                              ? 'hsl(var(--risk-medium))'
                              : 'hsl(var(--risk-high))'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uncertainty & Stability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bootstrap Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Segment Mean Uncertainty</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">Bootstrap confidence intervals for low-risk segment mean cost estimate.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>100 bootstrap iterations, 95% CI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bootstrapData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="iteration" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[1500, 2300]}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stackId="1"
                    stroke="none" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.1}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lower" 
                    stackId="2"
                    stroke="none" 
                    fill="hsl(var(--background))" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mean" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine 
                    y={1847} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5" 
                    label={{ value: 'Point Est.', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">95% CI:</span>
                <span className="font-mono font-medium ml-2">$1,698 - $2,012</span>
              </div>
              <div>
                <span className="text-muted-foreground">SE:</span>
                <span className="font-mono font-medium ml-2">$78</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Ablation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Ablation Study</CardTitle>
            <CardDescription>AUC impact when removing each feature</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature Removed</TableHead>
                  <TableHead className="text-right">AUC</TableHead>
                  <TableHead className="text-right">ΔAUC</TableHead>
                  <TableHead className="text-center">Critical?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ablationResults.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="font-mono text-sm">{row.feature}</TableCell>
                    <TableCell className="text-right font-mono">{row.auc.toFixed(3)}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline"
                        className={
                          Math.abs(row.delta) > 0.02 
                            ? 'bg-risk-high/10 text-risk-high border-risk-high/30'
                            : Math.abs(row.delta) > 0.005
                              ? 'bg-uncertainty/10 text-uncertainty border-uncertainty/30'
                              : 'bg-muted'
                        }
                      >
                        {row.delta.toFixed(3)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.abs(row.delta) > 0.01 ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              Features with ΔAUC &gt; 0.01 are considered critical for model performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskLab;
