import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Download, X, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const segmentData = [
  { 
    id: 1,
    name: 'Stable Low-Risk',
    size: 5432,
    pct: 42.3,
    meanCost: 1847,
    variance: 2340,
    catastrophicRate: 0.8,
    avgRiskScore: 18,
    uncertainty: 0.12,
    color: 'hsl(var(--risk-low))'
  },
  { 
    id: 2,
    name: 'Moderate Preventive',
    size: 4047,
    pct: 31.5,
    meanCost: 5623,
    variance: 8920,
    catastrophicRate: 4.2,
    avgRiskScore: 45,
    uncertainty: 0.18,
    color: 'hsl(var(--chart-4))'
  },
  { 
    id: 3,
    name: 'Chronic Management',
    size: 2403,
    pct: 18.7,
    meanCost: 14532,
    variance: 18470,
    catastrophicRate: 12.8,
    avgRiskScore: 68,
    uncertainty: 0.24,
    color: 'hsl(var(--risk-medium))'
  },
  { 
    id: 4,
    name: 'High Utilization',
    size: 965,
    pct: 7.5,
    meanCost: 42187,
    variance: 45230,
    catastrophicRate: 48.3,
    avgRiskScore: 89,
    uncertainty: 0.31,
    color: 'hsl(var(--risk-high))'
  },
];

// Generate t-SNE scatter data
const generateScatterData = () => {
  const data: any[] = [];
  segmentData.forEach((segment) => {
    for (let i = 0; i < Math.floor(segment.size / 50); i++) {
      const baseX = segment.id * 25 + (Math.random() - 0.5) * 20;
      const baseY = segment.avgRiskScore + (Math.random() - 0.5) * 30;
      data.push({
        x: baseX,
        y: baseY,
        segment: segment.name,
        color: segment.color
      });
    }
  });
  return data;
};

const scatterData = generateScatterData();

const segmentProfile = {
  features: [
    { name: 'Avg Age', value: 38.2, population: 45.6, diff: -7.4 },
    { name: 'BMI', value: 24.8, population: 28.3, diff: -3.5 },
    { name: 'ER Visits', value: 0.2, population: 1.1, diff: -0.9 },
    { name: 'Smokers %', value: 8.2, population: 18.7, diff: -10.5 },
    { name: 'Diabetics %', value: 4.1, population: 12.3, diff: -8.2 },
    { name: 'Exercise Rate', value: 72.3, population: 54.1, diff: 18.2 },
  ],
  costDistribution: [
    { range: '$0-1k', segment: 68, population: 35 },
    { range: '$1k-3k', segment: 24, population: 28 },
    { range: '$3k-5k', segment: 6, population: 15 },
    { range: '$5k-10k', segment: 2, population: 12 },
    { range: '$10k+', segment: 0, population: 10 },
  ]
};

const Segmentation = () => {
  const [method, setMethod] = useState('quantiles');
  const [numSegments, setNumSegments] = useState([4]);
  const [selectedSegment, setSelectedSegment] = useState<typeof segmentData[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Segmentation Explorer</h1>
        <p className="text-muted-foreground mt-1">Interactive clustering and member slicing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Segmentation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantiles">Risk Score Quantiles</SelectItem>
                  <SelectItem value="kmeans">K-Means Clustering</SelectItem>
                  <SelectItem value="tree">Decision Tree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Number of Segments</Label>
                <span className="text-sm font-medium">{numSegments[0]}</span>
              </div>
              <Slider
                value={numSegments}
                onValueChange={setNumSegments}
                min={2}
                max={10}
                step={1}
              />
            </div>

            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Filters</Label>
              <div className="space-y-2 mt-2">
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Age Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="18-35">18-35</SelectItem>
                    <SelectItem value="36-55">36-55</SelectItem>
                    <SelectItem value="56+">56+</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Insurance Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="medicare">Medicare</SelectItem>
                    <SelectItem value="medicaid">Medicaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scatter Plot */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Member Embedding (t-SNE)</CardTitle>
              <CardDescription>Click on clusters to explore segments</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" dataKey="x" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="number" dataKey="y" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number, name: string) => [value.toFixed(1), name]}
                  />
                  <Scatter data={scatterData} fill="hsl(var(--chart-1))">
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {segmentData.map((segment) => (
                <div key={segment.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-xs text-muted-foreground">{segment.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Segment Summary</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Mean Cost</TableHead>
                <TableHead className="text-right">Cost Variance</TableHead>
                <TableHead className="text-right">Catastrophic Rate</TableHead>
                <TableHead className="text-right">Avg Risk Score</TableHead>
                <TableHead className="text-right">Uncertainty</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segmentData.map((segment) => (
                <TableRow 
                  key={segment.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedSegment(segment)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-medium">{segment.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-medium">{segment.size.toLocaleString()}</span>
                      <span className="text-muted-foreground text-xs ml-1">({segment.pct}%)</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">${segment.meanCost.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${segment.variance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline" 
                      className={
                        segment.catastrophicRate < 5 
                          ? 'bg-risk-low/10 text-risk-low border-risk-low/30' 
                          : segment.catastrophicRate < 15 
                            ? 'bg-uncertainty/10 text-uncertainty border-uncertainty/30'
                            : 'bg-risk-high/10 text-risk-high border-risk-high/30'
                      }
                    >
                      {segment.catastrophicRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{segment.avgRiskScore}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground">±{(segment.uncertainty * 100).toFixed(0)}%</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Segment Detail Sheet */}
      <Sheet open={!!selectedSegment} onOpenChange={() => setSelectedSegment(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedSegment?.color }}
              />
              {selectedSegment?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedSegment?.size.toLocaleString()} members ({selectedSegment?.pct}% of population)
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Mean Cost</p>
                <p className="text-lg font-semibold">${selectedSegment?.meanCost.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="text-lg font-semibold">{selectedSegment?.avgRiskScore}</p>
              </div>
            </div>

            {/* Distinguishing Features */}
            <div>
              <h4 className="text-sm font-medium mb-3">Distinguishing Features vs Population</h4>
              <div className="space-y-2">
                {segmentProfile.features.map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm">{feature.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{feature.value}</span>
                      <div className={`flex items-center gap-1 text-xs ${
                        feature.diff > 0 ? 'text-risk-low' : 'text-risk-high'
                      }`}>
                        {feature.diff > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {feature.diff > 0 ? '+' : ''}{feature.diff}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Distribution Comparison */}
            <div>
              <h4 className="text-sm font-medium mb-3">Cost Distribution vs Population</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentProfile.costDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="range" type="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="segment" fill="hsl(var(--primary))" name="Segment %" radius={[0, 2, 2, 0]} />
                    <Bar dataKey="population" fill="hsl(var(--muted))" name="Population %" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Segmentation;
