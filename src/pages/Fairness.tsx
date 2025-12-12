import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, CheckCircle, AlertTriangle, Info, Shield } from 'lucide-react';
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

const subgroupPerformance = [
  { group: 'Male', auc: 0.887, f1: 0.821, lowRiskRate: 44.2, disparity: 1.04 },
  { group: 'Female', auc: 0.894, f1: 0.828, lowRiskRate: 40.8, disparity: 0.96 },
  { group: 'White', auc: 0.891, f1: 0.825, lowRiskRate: 45.1, disparity: 1.07 },
  { group: 'Black', auc: 0.879, f1: 0.812, lowRiskRate: 38.2, disparity: 0.90 },
  { group: 'Hispanic', auc: 0.884, f1: 0.818, lowRiskRate: 40.5, disparity: 0.96 },
  { group: 'Asian', auc: 0.896, f1: 0.834, lowRiskRate: 48.7, disparity: 1.15 },
  { group: 'Low Income', auc: 0.871, f1: 0.798, lowRiskRate: 32.4, disparity: 0.77 },
  { group: 'Mid Income', auc: 0.889, f1: 0.823, lowRiskRate: 42.8, disparity: 1.01 },
  { group: 'High Income', auc: 0.902, f1: 0.841, lowRiskRate: 51.2, disparity: 1.21 },
];

const calibrationByGroup = [
  { group: 'Male', predicted: 0.42, actual: 0.44 },
  { group: 'Female', predicted: 0.41, actual: 0.40 },
  { group: 'White', predicted: 0.45, actual: 0.45 },
  { group: 'Black', predicted: 0.38, actual: 0.41 },
  { group: 'Hispanic', predicted: 0.40, actual: 0.38 },
  { group: 'Asian', predicted: 0.49, actual: 0.47 },
];

const complianceChecklist = [
  { 
    id: 'data-limitations',
    title: 'Data Limitations Statement',
    description: 'Document known biases and limitations in MEPS data collection',
    status: 'complete',
  },
  { 
    id: 'non-underwriting',
    title: 'Non-Underwriting Intent Declaration',
    description: 'Confirm model is for research/population analytics, not individual underwriting',
    status: 'complete',
  },
  { 
    id: 'sensitivity-analysis',
    title: 'Sensitivity Analysis',
    description: 'Test model robustness across protected class definitions',
    status: 'complete',
  },
  { 
    id: 'disparate-impact',
    title: 'Disparate Impact Assessment',
    description: 'Evaluate 80% rule compliance for low-risk classification',
    status: 'warning',
  },
  { 
    id: 'model-documentation',
    title: 'Model Documentation',
    description: 'Complete model card with intended use and limitations',
    status: 'complete',
  },
  { 
    id: 'audit-trail',
    title: 'Audit Trail',
    description: 'Maintain versioned records of model decisions and updates',
    status: 'complete',
  },
];

const Fairness = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fairness & Compliance</h1>
          <p className="text-muted-foreground mt-1">Bias analysis, disparate impact assessment, and compliance documentation</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Fairness Report
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AUC Range</p>
                <p className="text-2xl font-bold mt-1">0.871 - 0.902</p>
                <p className="text-xs text-muted-foreground mt-1">Δ = 0.031</p>
              </div>
              <Badge variant="outline" className="bg-risk-low/10 text-risk-low border-risk-low/30">
                Good
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disparity Ratio Range</p>
                <p className="text-2xl font-bold mt-1">0.77 - 1.21</p>
                <p className="text-xs text-muted-foreground mt-1">80% rule threshold: 0.80</p>
              </div>
              <Badge variant="outline" className="bg-uncertainty/10 text-uncertainty border-uncertainty/30">
                Review
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Calibration Gap</p>
                <p className="text-2xl font-bold mt-1">3.0%</p>
                <p className="text-xs text-muted-foreground mt-1">Target: &lt;5%</p>
              </div>
              <Badge variant="outline" className="bg-risk-low/10 text-risk-low border-risk-low/30">
                Good
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Status</p>
                <p className="text-2xl font-bold mt-1">5/6</p>
                <p className="text-xs text-muted-foreground mt-1">Checks passed</p>
              </div>
              <Badge variant="outline" className="bg-uncertainty/10 text-uncertainty border-uncertainty/30">
                83%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Subgroup */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Model Performance by Subgroup</CardTitle>
            <CardDescription>Classification metrics across demographic segments</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subgroup</TableHead>
                <TableHead className="text-right">AUC</TableHead>
                <TableHead className="text-right">F1 Score</TableHead>
                <TableHead className="text-right">Low-Risk Rate</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Disparity Ratio
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Ratio of subgroup low-risk rate to overall population rate. Values below 0.80 may indicate disparate impact.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subgroupPerformance.map((row) => (
                <TableRow key={row.group}>
                  <TableCell className="font-medium">{row.group}</TableCell>
                  <TableCell className="text-right font-mono">{row.auc.toFixed(3)}</TableCell>
                  <TableCell className="text-right font-mono">{row.f1.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{row.lowRiskRate}%</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline"
                      className={
                        row.disparity >= 0.80 
                          ? 'bg-risk-low/10 text-risk-low border-risk-low/30'
                          : 'bg-risk-high/10 text-risk-high border-risk-high/30'
                      }
                    >
                      {row.disparity.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.disparity >= 0.80 ? (
                      <CheckCircle className="h-4 w-4 text-risk-low inline" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-risk-high inline" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calibration by Group */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calibration by Subgroup</CardTitle>
            <CardDescription>Predicted vs actual low-risk rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={calibrationByGroup} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 0.6]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis 
                    dataKey="group" 
                    type="category"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '']}
                  />
                  <Bar dataKey="predicted" fill="hsl(var(--primary))" name="Predicted" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-chart-2" />
                <span className="text-muted-foreground">Actual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Compliance Checklist
            </CardTitle>
            <CardDescription>Required documentation and analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceChecklist.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    item.status === 'complete' 
                      ? 'bg-risk-low/5 border-risk-low/20'
                      : item.status === 'warning'
                        ? 'bg-uncertainty/5 border-uncertainty/20'
                        : 'bg-muted/30'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.status === 'complete' ? (
                      <CheckCircle className="h-4 w-4 text-risk-low" />
                    ) : item.status === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-uncertainty" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      item.status === 'complete' 
                        ? 'bg-risk-low/10 text-risk-low border-risk-low/30'
                        : 'bg-uncertainty/10 text-uncertainty border-uncertainty/30'
                    }`}
                  >
                    {item.status === 'complete' ? 'Complete' : 'Review'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explainability Note */}
      <Card className="border-info/30 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Explainability Constraints</h4>
              <p className="text-sm text-muted-foreground mt-1">
                This model uses a GLM-based minimal structure to maximize interpretability. All feature coefficients 
                are directly interpretable as log-odds ratios, enabling clear explanation of classification decisions. 
                The reduced feature set (8 variables) was selected to maintain both predictive performance and 
                regulatory transparency requirements.
              </p>
              <div className="flex gap-4 mt-3">
                <Button variant="outline" size="sm">View Model Card</Button>
                <Button variant="outline" size="sm">Download Coefficients</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fairness;
