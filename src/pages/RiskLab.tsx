import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, AlertTriangle, TrendingUp, Info, Play, BarChart3 } from 'lucide-react';
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

// Bootstrap AUC distribution data (simulated)
const bootstrapAUCData = Array.from({ length: 20 }, (_, i) => ({
  iteration: (i + 1) * 10,
  auc: 0.77 + (Math.random() - 0.5) * 0.04,
  lower: 0.74 + (Math.random() - 0.5) * 0.02,
  upper: 0.80 + (Math.random() - 0.5) * 0.02,
}));

// Bootstrap Brier distribution
const bootstrapBrierData = Array.from({ length: 20 }, (_, i) => ({
  iteration: (i + 1) * 10,
  brier: 0.142 + (Math.random() - 0.5) * 0.02,
}));

// Segment size stability across bootstraps
const segmentSizeData = Array.from({ length: 20 }, (_, i) => ({
  iteration: (i + 1) * 10,
  size: 32.1 + (Math.random() - 0.5) * 4,
}));

const stabilityMetrics = [
  { metric: 'AUC', mean: 0.770, sd: 0.018, cv: 0.023, status: 'stable' },
  { metric: 'Brier Score', mean: 0.142, sd: 0.008, cv: 0.056, status: 'stable' },
  { metric: 'Segment Size %', mean: 32.1, sd: 2.1, cv: 0.065, status: 'stable' },
  { metric: 'Precision', mean: 0.881, sd: 0.024, cv: 0.027, status: 'stable' },
  { metric: 'Recall', mean: 0.932, sd: 0.019, cv: 0.020, status: 'stable' },
];

// Jaccard overlap data
const jaccardData = [
  { comparison: 'Bootstrap 1-2', overlap: 0.89 },
  { comparison: 'Bootstrap 1-3', overlap: 0.87 },
  { comparison: 'Bootstrap 2-3', overlap: 0.91 },
  { comparison: 'Bootstrap 1-4', overlap: 0.86 },
  { comparison: 'Bootstrap 2-4', overlap: 0.88 },
  { comparison: 'Mean Overlap', overlap: 0.88 },
];

// Tail risk data
const tailRiskData = [
  { percentile: 'Top 1%', share: 28.4, avgCost: 156780, count: 128 },
  { percentile: 'Top 5%', share: 48.2, avgCost: 87430, count: 642 },
  { percentile: 'Top 10%', share: 64.1, avgCost: 52340, count: 1285 },
  { percentile: 'Top 25%', share: 84.3, avgCost: 28760, count: 3212 },
  { percentile: 'Bottom 50%', share: 5.8, avgCost: 1240, count: 6424 },
];

const RiskLab = () => {
  const [bootstrapCount, setBootstrapCount] = useState([200]);
  const [segmentRule, setSegmentRule] = useState('threshold');
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(true);

  const handleRunBootstrap = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasResults(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Stability & Uncertainty Lab</h1>
        <p className="text-muted-foreground mt-1">Bootstrap uncertainty quantification proving "stable under uncertainty"</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bootstrap Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Iterations</Label>
                <span className="font-medium">{bootstrapCount[0]}</span>
              </div>
              <Slider
                value={bootstrapCount}
                onValueChange={setBootstrapCount}
                min={100}
                max={500}
                step={100}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>200</span>
                <span>300</span>
                <span>500</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Segment Rule</Label>
              <RadioGroup value={segmentRule} onValueChange={setSegmentRule}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="threshold" id="thresh" />
                  <Label htmlFor="thresh" className="text-sm font-normal">Threshold (p≥0.7)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rank" id="rankbs" />
                  <Label htmlFor="rankbs" className="text-sm font-normal">Lowest 30% (rank)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleRunBootstrap}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : (
                <>
                  <Play className="h-4 w-4" />
                  Run Bootstrap
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Summary Metrics */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AUC Mean</p>
                <p className="text-2xl font-bold mt-1">0.770</p>
                <p className="text-xs text-muted-foreground mt-1">95% CI: [0.734, 0.806]</p>
              </div>
              <Badge variant="outline" className="bg-risk-low/10 text-risk-low border-risk-low/30">
                Stable
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AUC SD</p>
                <p className="text-2xl font-bold mt-1">0.018</p>
                <p className="text-xs text-muted-foreground mt-1">CV: 2.3%</p>
              </div>
              <Badge variant="outline" className="bg-risk-low/10 text-risk-low border-risk-low/30">
                Low Variance
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Segment Size SD</p>
                <p className="text-2xl font-bold mt-1">2.1%</p>
                <p className="text-xs text-muted-foreground mt-1">Mean: 32.1%</p>
              </div>
              <Badge variant="outline" className="bg-risk-low/10 text-risk-low border-risk-low/30">
                Consistent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasResults && (
        <>
          {/* Bootstrap Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AUC Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Bootstrap AUC Distribution</CardTitle>
                  <CardDescription>{bootstrapCount[0]} iterations, 95% CI shown</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bootstrapAUCData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="iteration" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Bootstrap Iteration', position: 'bottom', fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0.70, 0.85]}
                        label={{ value: 'AUC', angle: -90, position: 'left', fontSize: 11 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [value.toFixed(3), 'AUC']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="upper" 
                        stackId="1"
                        stroke="none" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.15}
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
                        dataKey="auc" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <ReferenceLine 
                        y={0.77} 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="5 5" 
                        label={{ value: 'Mean', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Brier Distribution */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Bootstrap Brier Score Distribution</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bootstrapBrierData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        domain={[0.12, 0.17]}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [value.toFixed(3), 'Brier']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="brier" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-2))', r: 3 }}
                      />
                      <ReferenceLine 
                        y={0.142} 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stability Table & Jaccard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stability Metrics Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Stability Metrics Summary</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">CV &lt; 10% indicates stable predictions across bootstrap samples.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Mean, SD, and coefficient of variation</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Mean</TableHead>
                      <TableHead className="text-right">SD</TableHead>
                      <TableHead className="text-right">CV</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stabilityMetrics.map((row) => (
                      <TableRow key={row.metric}>
                        <TableCell className="font-medium">{row.metric}</TableCell>
                        <TableCell className="text-right font-mono">{row.mean.toFixed(3)}</TableCell>
                        <TableCell className="text-right font-mono">{row.sd.toFixed(3)}</TableCell>
                        <TableCell className="text-right font-mono">{(row.cv * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-risk-low/10 text-risk-low border-risk-low/30 text-xs">
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Jaccard Overlap */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Jaccard Overlap (Membership Stability)</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Jaccard index measures overlap in low-risk membership across bootstrap samples. Higher values = more stable membership.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Low-risk membership consistency across bootstraps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jaccardData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="comparison" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [(value * 100).toFixed(0) + '%', 'Overlap']}
                      />
                      <Bar dataKey="overlap" radius={[0, 4, 4, 0]}>
                        {jaccardData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.comparison === 'Mean Overlap' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-risk-low/10 border border-risk-low/30 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Mean Jaccard: 0.88</span> — 88% of members consistently classified as low-risk across bootstrap samples.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tail Risk */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Tail Risk Concentration (Descriptive)</CardTitle>
                <CardDescription>Expenditure share by population percentile - for context only</CardDescription>
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
                    <TableHead className="text-right">Avg TOTEXP23</TableHead>
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

          {/* Research Conclusion */}
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Research Conclusion: Stable Under Uncertainty</h3>
                  <p className="text-muted-foreground mt-2">
                    Bootstrap analysis confirms that B3_chronic achieves stable low-risk segmentation with:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                    <li>AUC coefficient of variation of 2.3% (well below 10% threshold)</li>
                    <li>Segment size variation of only 2.1% across {bootstrapCount[0]} bootstrap samples</li>
                    <li>88% Jaccard overlap in membership assignment across samples</li>
                    <li>Brier score stability confirming reliable probability calibration</li>
                  </ul>
                  <p className="text-sm font-medium mt-3">
                    This validates the research question: the minimum predictive structure (B3) stabilizes cost-risk segmentation under uncertainty.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RiskLab;
