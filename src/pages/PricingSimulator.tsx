import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Plus, Play, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const scenarioComparison = [
  {
    name: 'Baseline',
    basePremium: 450,
    lossRatio: 82.4,
    profitMargin: 8.2,
    retentionImpact: 0,
    stability: 0.72,
  },
  {
    name: 'Scenario A',
    basePremium: 420,
    lossRatio: 78.1,
    profitMargin: 12.4,
    retentionImpact: 4.2,
    stability: 0.81,
  },
  {
    name: 'Scenario B',
    basePremium: 480,
    lossRatio: 75.8,
    profitMargin: 14.8,
    retentionImpact: -2.8,
    stability: 0.85,
  },
];

const segmentLossRatios = [
  { segment: 'Stable Low-Risk', lossRatio: 42.3, profit: 28400, color: 'hsl(var(--risk-low))' },
  { segment: 'Moderate Preventive', lossRatio: 78.2, profit: 12800, color: 'hsl(var(--chart-4))' },
  { segment: 'Chronic Management', lossRatio: 94.5, profit: -4200, color: 'hsl(var(--risk-medium))' },
  { segment: 'High Utilization', lossRatio: 142.8, profit: -38600, color: 'hsl(var(--risk-high))' },
];

const profitDistribution = Array.from({ length: 30 }, (_, i) => ({
  profit: -50000 + i * 5000,
  baseline: Math.exp(-Math.pow((i - 12) / 5, 2) / 2) * 100,
  scenario: Math.exp(-Math.pow((i - 15) / 4, 2) / 2) * 100,
}));

const PricingSimulator = () => {
  const [basePremium, setBasePremium] = useState(450);
  const [adminLoad, setAdminLoad] = useState([12]);
  const [riskMargin, setRiskMargin] = useState([8]);
  const [reinsuranceThreshold, setReinsuranceThreshold] = useState(50000);
  const [wellnessDiscount, setWellnessDiscount] = useState(true);
  const [preventiveCredit, setPreventiveCredit] = useState(false);
  const [segmentPricing, setSegmentPricing] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pricing & Retention Simulator</h1>
          <p className="text-muted-foreground mt-1">Model pricing scenarios and assess profit stability impact</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Scenario Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Panel */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pricing Inputs</CardTitle>
            <CardDescription>Configure base pricing parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Base Premium (PMPM)</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 text-muted-foreground">$</span>
                <Input 
                  type="number"
                  value={basePremium}
                  onChange={(e) => setBasePremium(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Admin Load</Label>
                <span className="text-sm font-medium">{adminLoad[0]}%</span>
              </div>
              <Slider
                value={adminLoad}
                onValueChange={setAdminLoad}
                min={5}
                max={25}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Risk Margin</Label>
                <span className="text-sm font-medium">{riskMargin[0]}%</span>
              </div>
              <Slider
                value={riskMargin}
                onValueChange={setRiskMargin}
                min={2}
                max={15}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Reinsurance Threshold</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 text-muted-foreground">$</span>
                <Input 
                  type="number"
                  value={reinsuranceThreshold}
                  onChange={(e) => setReinsuranceThreshold(Number(e.target.value))}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <Label className="text-sm text-muted-foreground">Retention Levers</Label>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Wellness Discount</p>
                  <p className="text-xs text-muted-foreground">5% off for healthy behaviors</p>
                </div>
                <Switch checked={wellnessDiscount} onCheckedChange={setWellnessDiscount} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Preventive Care Credit</p>
                  <p className="text-xs text-muted-foreground">$50/year for screenings</p>
                </div>
                <Switch checked={preventiveCredit} onCheckedChange={setPreventiveCredit} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Segment-Specific Pricing</p>
                  <p className="text-xs text-muted-foreground">Vary premiums by risk tier</p>
                </div>
                <Switch checked={segmentPricing} onCheckedChange={setSegmentPricing} />
              </div>
            </div>

            <Button className="w-full gap-2">
              <Play className="h-4 w-4" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Loss Ratio by Segment */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Expected Loss Ratio by Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={segmentLossRatios} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 160]}
                  />
                  <YAxis 
                    dataKey="segment" 
                    type="category"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={95}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Loss Ratio']}
                  />
                  <Bar dataKey="lossRatio" radius={[0, 4, 4, 0]}>
                    {segmentLossRatios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <CartesianGrid 
                    x={100} 
                    strokeDasharray="5 5" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {segmentLossRatios.map((segment) => (
                <div 
                  key={segment.segment}
                  className={`p-3 rounded-lg border ${
                    segment.profit > 0 
                      ? 'bg-risk-low/5 border-risk-low/20' 
                      : 'bg-risk-high/5 border-risk-high/20'
                  }`}
                >
                  <p className="text-xs text-muted-foreground truncate">{segment.segment}</p>
                  <p className={`text-lg font-bold ${segment.profit > 0 ? 'text-risk-low' : 'text-risk-high'}`}>
                    {segment.profit > 0 ? '+' : ''}${(segment.profit / 1000).toFixed(1)}k
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profit Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profit Distribution Simulation</CardTitle>
            <CardDescription>Monte Carlo simulation of portfolio profit outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="scenarioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="profit" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="hsl(var(--muted))" 
                    fill="url(#baselineGradient)"
                    name="Baseline"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="scenario" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#scenarioGradient)"
                    name="Current Scenario"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted" />
                <span className="text-muted-foreground">Baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Current Scenario</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Comparison */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Scenario Comparison</CardTitle>
            <CardDescription>Compare pricing scenarios side-by-side</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Scenario
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead className="text-right">Base Premium</TableHead>
                <TableHead className="text-right">Loss Ratio</TableHead>
                <TableHead className="text-right">Profit Margin</TableHead>
                <TableHead className="text-right">Retention Impact</TableHead>
                <TableHead className="text-right">Stability Index</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarioComparison.map((scenario, index) => (
                <TableRow key={scenario.name} className={index === 0 ? 'bg-muted/30' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {scenario.name}
                      {index === 0 && <Badge variant="secondary" className="text-xs">Current</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">${scenario.basePremium}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline"
                      className={
                        scenario.lossRatio < 80 
                          ? 'bg-risk-low/10 text-risk-low' 
                          : 'bg-uncertainty/10 text-uncertainty'
                      }
                    >
                      {scenario.lossRatio}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-risk-low">
                    +{scenario.profitMargin}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      scenario.retentionImpact >= 0 ? 'text-risk-low' : 'text-risk-high'
                    }`}>
                      {scenario.retentionImpact >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {scenario.retentionImpact >= 0 ? '+' : ''}{scenario.retentionImpact}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${scenario.stability * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{scenario.stability.toFixed(2)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingSimulator;
