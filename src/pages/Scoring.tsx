import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Play, 
  Download, 
  CheckCircle, 
  Minus,
  Info,
  Lock,
  ChevronDown,
  AlertTriangle,
  FlaskConical,
  ShieldCheck
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRole } from '@/contexts/RoleContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

const calibrationData = [
  { predicted: 0.1, actual: 0.12 },
  { predicted: 0.2, actual: 0.19 },
  { predicted: 0.3, actual: 0.28 },
  { predicted: 0.4, actual: 0.41 },
  { predicted: 0.5, actual: 0.52 },
  { predicted: 0.6, actual: 0.58 },
  { predicted: 0.7, actual: 0.71 },
  { predicted: 0.8, actual: 0.77 },
  { predicted: 0.9, actual: 0.88 },
];

// B3_chronic features
const b3Features = [
  { name: 'PHYEXE53', category: 'Behavior', description: 'Physical exercise frequency', selected: true },
  { name: 'OFTSMK53', category: 'Behavior', description: 'Smoking frequency', selected: true },
  { name: 'RTHLTH53', category: 'Mental Health', description: 'Self-rated health', selected: true },
  { name: 'MNHLTH53', category: 'Mental Health', description: 'Mental health status', selected: true },
  { name: 'K6SUM42', category: 'Mental Health', description: 'Kessler-6 distress score', selected: true },
  { name: 'PHQ242', category: 'Mental Health', description: 'PHQ-2 depression', selected: true },
  { name: 'WLKLIM53', category: 'Functional', description: 'Walking limitation', selected: true },
  { name: 'ACTLIM53', category: 'Functional', description: 'Activity limitation', selected: true },
  { name: 'SOCLIM53', category: 'Functional', description: 'Social limitation', selected: true },
  { name: 'COGLIM53', category: 'Functional', description: 'Cognitive limitation', selected: true },
  { name: 'DIABDX_M18', category: 'Chronic', description: 'Diabetes diagnosis', selected: true },
  { name: 'HIBPDX', category: 'Chronic', description: 'Hypertension diagnosis', selected: true },
];

// Research benchmark models
const benchmarkModels = [
  { id: 'B0', name: 'B0: Behavior Only', features: 'PHYEXE53, OFTSMK53', auc: 0.58, warning: 'Insufficient for stable segmentation' },
  { id: 'B1', name: 'B1: Behavior + Mental Health', features: 'B0 + RTHLTH/MNHLTH/K6/PHQ2', auc: 0.68, warning: null },
  { id: 'B2', name: 'B2: Behavior + Functional', features: 'B0 + Limitation flags', auc: 0.65, warning: null },
  { id: 'B3', name: 'B3: Chronic (Production)', features: 'B1 + B2 + Chronic burden', auc: 0.77, warning: null, isProduction: true },
  { id: 'B4', name: 'B4: SES/Insurance', features: 'B3 + Demographics', auc: 0.78, warning: null },
  { id: 'B5', name: 'B5: Non-label Utilization', features: 'B4 + OPTOT/RXTOT/etc.', auc: 0.84, warning: 'Outcome-proximal, not deployable' },
];

const confusionMatrix = {
  tp: 3847,
  fp: 521,
  fn: 277,
  tn: 8202
};

const Scoring = () => {
  const { role, mode } = useRole();
  const [scoringMethod, setScoringMethod] = useState('threshold');
  const [isScoring, setIsScoring] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  const handleScore = () => {
    setIsScoring(true);
    setTimeout(() => {
      setIsScoring(false);
      setHasResults(true);
    }, 2000);
  };

  const canAccessBenchmarks = role !== 'executive' && mode === 'research';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Model Scoring (Production)</h1>
        <p className="text-muted-foreground mt-1">Run B3_chronic XGBoost model to score low-risk probability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Scoring Configuration
            </CardTitle>
            <CardDescription>Production model locked to B3_chronic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Locked Model */}
            <div className="p-3 bg-risk-low/10 border border-risk-low/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-risk-low" />
                <span className="text-sm font-medium">B3_chronic XGB (Production)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                low_risk_model_B3_chronic_xgb.joblib
              </p>
              <Badge variant="outline" className="mt-2 text-xs">12 features</Badge>
            </div>

            {/* Scoring Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Scoring Method</Label>
              <RadioGroup value={scoringMethod} onValueChange={setScoringMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="threshold" id="threshold" />
                  <Label htmlFor="threshold" className="text-sm font-normal">
                    Threshold (p≥0.7 default)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rank" id="rank" />
                  <Label htmlFor="rank" className="text-sm font-normal">
                    Lowest-risk 30% (rank-based)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Feature List */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">B3 Feature Block</Label>
              <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded-lg max-h-32 overflow-y-auto">
                {b3Features.map((f) => (
                  <div key={f.name} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-risk-low" />
                    <span className="font-mono">{f.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4">{f.category}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleScore}
              disabled={isScoring}
            >
              {isScoring ? (
                <>Scoring...</>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Score Members
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Model Performance (B3_chronic)</CardTitle>
            <CardDescription>Training/validation baseline metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {hasResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">0.77</p>
                    <p className="text-xs text-muted-foreground mt-1">AUC-ROC</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">0.142</p>
                    <p className="text-xs text-muted-foreground mt-1">Brier Score</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">0.018</p>
                    <p className="text-xs text-muted-foreground mt-1">AUC SD (Bootstrap)</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-foreground">2.1%</p>
                    <p className="text-xs text-muted-foreground mt-1">Segment Size SD</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: These are baseline metrics from model training. Run bootstrap on Stability Lab for current-run uncertainty.
                </p>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Run scoring to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {hasResults && (
        <>
          {/* Calibration & Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calibration Curve */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Calibration Curve</CardTitle>
                  <CardDescription>Predicted vs actual positive rate</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calibrationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="predicted" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Mean Predicted', position: 'bottom', fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Fraction Positive', angle: -90, position: 'left', fontSize: 11 }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <ReferenceLine 
                        segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="5 5" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Confusion Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confusion Matrix</CardTitle>
                <CardDescription>At threshold p≥0.7</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                  <div></div>
                  <div className="text-center text-xs text-muted-foreground pb-2">Predicted +</div>
                  <div className="text-center text-xs text-muted-foreground pb-2">Predicted -</div>
                  
                  <div className="text-right text-xs text-muted-foreground pr-2 flex items-center justify-end">Actual +</div>
                  <div className="bg-risk-low/20 border border-risk-low/30 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-risk-low">{confusionMatrix.tp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">True Positive</p>
                  </div>
                  <div className="bg-risk-high/10 border border-risk-high/20 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-risk-high">{confusionMatrix.fn.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">False Negative</p>
                  </div>
                  
                  <div className="text-right text-xs text-muted-foreground pr-2 flex items-center justify-end">Actual -</div>
                  <div className="bg-risk-high/10 border border-risk-high/20 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-risk-high">{confusionMatrix.fp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">False Positive</p>
                  </div>
                  <div className="bg-risk-low/20 border border-risk-low/30 rounded-lg p-4 text-center">
                    <p className="text-lg font-bold text-risk-low">{confusionMatrix.tn.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">True Negative</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* B3 Production Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Minimum Predictive Structure: B3_chronic</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">B3 represents the minimum stable structure: behavior + mental health + functional + chronic features. Behavior-only (B0) was insufficient.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>Deployed production model - stability verified via bootstrap</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Behavior', 'Mental Health', 'Functional', 'Chronic'].map((category) => (
                  <div key={category} className="p-3 bg-primary/5 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="space-y-1">
                      {b3Features.filter(f => f.category === category).map(f => (
                        <p key={f.name} className="text-xs font-mono text-muted-foreground">{f.name}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Benchmarks (Collapsible) */}
          {canAccessBenchmarks && (
            <Collapsible open={showBenchmarks} onOpenChange={setShowBenchmarks}>
              <Card className="border-uncertainty/30">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-uncertainty" />
                        <CardTitle className="text-base">Research Benchmarks</CardTitle>
                        <Badge variant="outline" className="bg-uncertainty/10 text-uncertainty border-uncertainty/30">
                          Read-only Comparison
                        </Badge>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", showBenchmarks && "rotate-180")} />
                    </div>
                    <CardDescription>Compare B3 against other feature blocks (B0-B5)</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Model</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead className="text-right">AUC</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {benchmarkModels.map((model) => (
                          <TableRow key={model.id} className={cn(model.isProduction && "bg-primary/5")}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {model.name}
                                {model.isProduction && (
                                  <Badge variant="default" className="bg-risk-low text-risk-low-foreground text-xs">
                                    Production
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {model.features}
                            </TableCell>
                            <TableCell className="text-right font-mono">{model.auc.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              {model.warning ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="h-4 w-4 text-uncertainty mx-auto" />
                                  </TooltipTrigger>
                                  <TooltipContent>{model.warning}</TooltipContent>
                                </Tooltip>
                              ) : model.isProduction ? (
                                <CheckCircle className="h-4 w-4 text-risk-low mx-auto" />
                              ) : (
                                <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="mt-4 p-3 bg-uncertainty/10 border border-uncertainty/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-uncertainty shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Research Benchmark Warning</p>
                          <p>B5 (utilization) achieves higher AUC but uses outcome-proximal features. B0 (behavior-only) is insufficient for stable segmentation. B3 represents the minimum stable structure for production use.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Export */}
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Scored Dataset
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Scoring;
