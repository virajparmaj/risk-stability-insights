import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Edit, Users, DollarSign, Activity, Heart, Brain, Dumbbell, Cigarette } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const definitionRules = [
  { variable: 'TOTEXP23', operator: '<', value: 'Bottom 30%', description: 'Expenditure percentile (label-defining)' },
  { variable: 'ERTOT23', operator: '=', value: '0', description: 'ER visits (label-defining)' },
  { variable: 'IPDIS23', operator: '=', value: '0', description: 'Inpatient discharges (label-defining)' },
];

const segmentSummary = {
  size: 4124,
  pct: 32.1,
  meanCost: 1847,
  medianCost: 1234,
  variance: 2340,
  erAvg: 0,
  ipAvg: 0,
};

// MEPS-available behavior features (only PHYEXE53 and OFTSMK53)
const behaviorSignature = [
  { metric: 'Regular Exercise (PHYEXE53=4-5)', segment: 68, population: 42, diff: 26 },
  { metric: 'Some Exercise (PHYEXE53=2-3)', segment: 24, population: 31, diff: -7 },
  { metric: 'No Exercise (PHYEXE53=1)', segment: 8, population: 27, diff: -19 },
  { metric: 'Never Smoker (OFTSMK53=1)', segment: 78, population: 62, diff: 16 },
  { metric: 'Former Smoker (OFTSMK53=2)', segment: 14, population: 18, diff: -4 },
  { metric: 'Current Smoker (OFTSMK53=3-4)', segment: 8, population: 20, diff: -12 },
];

// Mental health indicators
const mentalHealthSignature = [
  { metric: 'Excellent Health (RTHLTH53=1)', segment: 42, population: 22, diff: 20 },
  { metric: 'Good Mental Health (MNHLTH53=1-2)', segment: 76, population: 58, diff: 18 },
  { metric: 'Low Distress (K6SUM42 ≤ 5)', segment: 84, population: 61, diff: 23 },
  { metric: 'No Depression (PHQ242 ≤ 2)', segment: 89, population: 72, diff: 17 },
];

// Functional limitations (using LIMIT_CT and flags)
const functionalSignature = [
  { type: 'No Walking Limitation (WLKLIM53=0)', segment: 94.2, population: 81.3 },
  { type: 'No Activity Limitation (ACTLIM53=0)', segment: 91.8, population: 76.4 },
  { type: 'No Social Limitation (SOCLIM53=0)', segment: 96.1, population: 84.2 },
  { type: 'No Cognitive Limitation (COGLIM53=0)', segment: 97.8, population: 89.1 },
];

// Chronic burden (using CHRONIC_CT and dx flags)
const clinicalBurden = [
  { condition: 'Diabetes (DIABDX_M18)', segment: 4.1, population: 12.3 },
  { condition: 'Hypertension (HIBPDX)', segment: 12.3, population: 28.7 },
  { condition: 'Heart Disease (CHDDX)', segment: 1.2, population: 5.8 },
  { condition: 'Asthma (ASTHDX)', segment: 5.2, population: 8.9 },
  { condition: 'Arthritis (ARTHDX)', segment: 7.4, population: 18.6 },
];

const comparisonData = [
  { metric: 'Mean P(Low-Risk)', lowRisk: 0.82, nonLowRisk: 0.24, population: 0.42, unit: '' },
  { metric: 'Median TOTEXP23', lowRisk: 1234, nonLowRisk: 8934, population: 3421, unit: '$' },
  { metric: 'K6SUM42 Mean', lowRisk: 2.8, nonLowRisk: 7.4, population: 5.1, unit: '' },
  { metric: 'CHRONIC_CT Mean', lowRisk: 0.4, nonLowRisk: 1.8, population: 1.2, unit: '' },
  { metric: 'LIMIT_CT Mean', lowRisk: 0.1, nonLowRisk: 0.8, population: 0.5, unit: '' },
];

const LowRiskProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Low-Risk Member Profile</h1>
          <p className="text-muted-foreground mt-1">MEPS 2023 predicted low-risk segment characteristics</p>
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
            <CardTitle className="text-base">Low-Risk Label Definition</CardTitle>
            <Badge variant="outline" className="text-xs">Training Only</Badge>
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
            <p className="text-xs text-muted-foreground mt-3 p-2 bg-uncertainty/10 rounded-lg border border-uncertainty/20">
              <strong>Note:</strong> These label-defining variables are NEVER used as predictors in scoring. Only B3_chronic features are used.
            </p>
          </CardContent>
        </Card>

        {/* Segment Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Predicted Low-Risk Segment Summary</CardTitle>
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
                  <span className="text-xs font-medium">Mean TOTEXP23</span>
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
        {/* Behavioral Signature (MEPS-available only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              Behavior Signature
            </CardTitle>
            <CardDescription>PHYEXE53 (exercise) and OFTSMK53 (smoking) only</CardDescription>
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

        {/* Mental Health Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-chart-2" />
              Mental Health Profile
            </CardTitle>
            <CardDescription>RTHLTH53, MNHLTH53, K6SUM42, PHQ242</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentalHealthSignature.map((item) => (
                <div key={item.metric} className="flex items-center justify-between">
                  <span className="text-sm">{item.metric}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-chart-2"
                        style={{ width: `${item.segment}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10">{item.segment}%</span>
                    <Badge 
                      variant="outline" 
                      className="text-risk-low"
                    >
                      +{item.diff}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Functional Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Functional Status
            </CardTitle>
            <CardDescription>Limitation flags (LIMIT_CT)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {functionalSignature.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.segment}%</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-risk-low rounded-full"
                        style={{ width: `${(item.segment / 100) * 100}%` }}
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

        {/* Clinical Burden */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-risk-high" />
              Chronic Burden
            </CardTitle>
            <CardDescription>CHRONIC_CT and diagnosis flags prevalence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={clinicalBurden} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
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

      {/* Comparison Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Compare Against</CardTitle>
          <Select defaultValue="non_low_risk">
            <SelectTrigger className="w-48 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non_low_risk">Predicted Non-Low-Risk</SelectItem>
              <SelectItem value="population">Whole Population</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Pred. Low-Risk</TableHead>
                <TableHead className="text-right">Pred. Non-Low-Risk</TableHead>
                <TableHead className="text-right">Population</TableHead>
                <TableHead className="text-right">SMD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell className="text-right font-mono text-risk-low">
                    {row.unit}{typeof row.lowRisk === 'number' && row.lowRisk >= 1 ? row.lowRisk.toLocaleString() : row.lowRisk}
                  </TableCell>
                  <TableCell className="text-right font-mono text-risk-high">
                    {row.unit}{typeof row.nonLowRisk === 'number' && row.nonLowRisk >= 1 ? row.nonLowRisk.toLocaleString() : row.nonLowRisk}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {row.unit}{typeof row.population === 'number' && row.population >= 1 ? row.population.toLocaleString() : row.population}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {row.metric === 'Mean P(Low-Risk)' ? '2.14' : 
                       row.metric === 'Median TOTEXP23' ? '-1.87' :
                       row.metric === 'K6SUM42 Mean' ? '-1.23' :
                       row.metric === 'CHRONIC_CT Mean' ? '-1.12' : '-0.98'}
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
  );
};

export default LowRiskProfile;
