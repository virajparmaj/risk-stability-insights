import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Edit, Users, DollarSign, Activity, Heart, Brain } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const definitionRules = [
  { variable: 'TOTEXP', operator: '<', value: '$5,000', description: 'Annual expenditure threshold' },
  { variable: 'ERTOT', operator: '≤', value: '1', description: 'Emergency room visits' },
  { variable: 'IPDIS', operator: '=', value: '0', description: 'Inpatient discharges' },
  { variable: 'Chronic Count', operator: '≤', value: '1', description: 'Number of chronic conditions' },
];

const segmentSummary = {
  size: 5432,
  pct: 42.3,
  meanCost: 1847,
  medianCost: 1234,
  variance: 2340,
  erAvg: 0.2,
  ipAvg: 0.01,
};

const behaviorSignature = [
  { metric: 'BMI < 25 (Healthy)', segment: 48, population: 32, diff: 16 },
  { metric: 'BMI 25-30 (Overweight)', segment: 38, population: 35, diff: 3 },
  { metric: 'BMI > 30 (Obese)', segment: 14, population: 33, diff: -19 },
  { metric: 'Non-Smoker', segment: 92, population: 81, diff: 11 },
  { metric: 'Regular Exercise', segment: 72, population: 54, diff: 18 },
  { metric: 'Healthy Diet Score', segment: 68, population: 45, diff: 23 },
  { metric: 'Low Alcohol', segment: 85, population: 71, diff: 14 },
];

const clinicalBurden = [
  { condition: 'Hypertension', segment: 12.3, population: 28.7 },
  { condition: 'Diabetes', segment: 4.1, population: 12.3 },
  { condition: 'High Cholesterol', segment: 8.7, population: 21.4 },
  { condition: 'Asthma', segment: 5.2, population: 8.9 },
  { condition: 'Depression', segment: 6.8, population: 14.2 },
  { condition: 'Arthritis', segment: 7.4, population: 18.6 },
];

const limitations = [
  { type: 'ADL Limitations', segment: 2.1, population: 8.7 },
  { type: 'IADL Limitations', segment: 1.8, population: 7.2 },
  { type: 'Mobility Issues', segment: 3.4, population: 12.8 },
  { type: 'Cognitive Limitations', segment: 0.8, population: 3.2 },
];

const comparisonData = [
  { metric: 'Avg TOTEXP', lowRisk: 1847, highRisk: 28934, population: 8234, unit: '$' },
  { metric: 'ER Visits', lowRisk: 0.2, highRisk: 3.8, population: 1.1, unit: '' },
  { metric: 'IP Stays', lowRisk: 0.01, highRisk: 0.84, population: 0.23, unit: '' },
  { metric: 'Chronic Conditions', lowRisk: 0.4, highRisk: 3.2, population: 1.4, unit: '' },
  { metric: 'Rx Fills', lowRisk: 4.2, highRisk: 18.7, population: 9.3, unit: '' },
];

const LowRiskProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Low-Risk Member Profile</h1>
          <p className="text-muted-foreground mt-1">Deep dive into stable low-risk segment characteristics</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Definition Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Low-Risk Definition</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 h-7">
              <Edit className="h-3 w-3" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {definitionRules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{rule.variable}</Badge>
                    <span className="text-sm">{rule.operator}</span>
                    <span className="text-sm font-medium">{rule.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Members must satisfy all criteria above to be classified as low-risk.
            </p>
          </CardContent>
        </Card>

        {/* Segment Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Segment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-risk-low/10 rounded-lg border border-risk-low/20">
                <div className="flex items-center gap-2 text-risk-low mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Size</span>
                </div>
                <p className="text-2xl font-bold">{segmentSummary.size.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{segmentSummary.pct}% of population</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium">Mean Cost</span>
                </div>
                <p className="text-2xl font-bold">${segmentSummary.meanCost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Median: ${segmentSummary.medianCost.toLocaleString()}</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-medium">Cost Variance</span>
                </div>
                <p className="text-2xl font-bold">${segmentSummary.variance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Low volatility</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs font-medium">Utilization</span>
                </div>
                <p className="text-lg font-bold">ER: {segmentSummary.erAvg}</p>
                <p className="text-xs text-muted-foreground">IP: {segmentSummary.ipAvg}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavioral Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Behavioral Signature
            </CardTitle>
            <CardDescription>Health behavior indicators vs population</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {behaviorSignature.map((item) => (
                <div key={item.metric} className="flex items-center justify-between">
                  <span className="text-sm">{item.metric}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${item.segment}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10">{item.segment}%</span>
                    <Badge 
                      variant="outline" 
                      className={item.diff > 0 ? 'text-risk-low' : 'text-risk-high'}
                    >
                      {item.diff > 0 ? '+' : ''}{item.diff}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clinical Burden */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-risk-high" />
              Clinical Burden
            </CardTitle>
            <CardDescription>Chronic condition prevalence (% of segment)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={clinicalBurden} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 35]} />
                  <YAxis dataKey="condition" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="segment" fill="hsl(var(--primary))" name="Low-Risk %" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="population" fill="hsl(var(--muted))" name="Population %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              Functional Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {limitations.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.segment}%</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.segment / item.population) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      Pop: {item.population}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Compare Against</CardTitle>
            <Select defaultValue="high_risk">
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_risk">High Risk</SelectItem>
                <SelectItem value="population">Whole Population</SelectItem>
                <SelectItem value="moderate">Moderate Risk</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Low-Risk</TableHead>
                  <TableHead className="text-right">High-Risk</TableHead>
                  <TableHead className="text-right">Population</TableHead>
                  <TableHead className="text-right">SMD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row) => (
                  <TableRow key={row.metric}>
                    <TableCell className="font-medium">{row.metric}</TableCell>
                    <TableCell className="text-right font-mono text-risk-low">
                      {row.unit}{row.lowRisk.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-risk-high">
                      {row.unit}{row.highRisk.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {row.unit}{row.population.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        {((row.lowRisk - row.highRisk) / Math.sqrt((row.lowRisk + row.highRisk) / 2)).toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              SMD = Standardized Mean Difference. Values &gt; |0.2| indicate meaningful differences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LowRiskProfile;
