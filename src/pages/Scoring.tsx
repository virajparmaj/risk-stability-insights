import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Download, 
  CheckCircle, 
  Minus,
  Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';

const calibrationData = [
  { predicted: 0.1, actual: 0.08 },
  { predicted: 0.2, actual: 0.18 },
  { predicted: 0.3, actual: 0.31 },
  { predicted: 0.4, actual: 0.42 },
  { predicted: 0.5, actual: 0.48 },
  { predicted: 0.6, actual: 0.59 },
  { predicted: 0.7, actual: 0.72 },
  { predicted: 0.8, actual: 0.78 },
  { predicted: 0.9, actual: 0.91 },
];

const residualData = Array.from({ length: 100 }, (_, i) => ({
  predicted: Math.random() * 20000,
  residual: (Math.random() - 0.5) * 6000,
}));

const minimalStructureFeatures = [
  { name: 'ERTOT', selected: true, importance: 0.234 },
  { name: 'IPDIS', selected: true, importance: 0.187 },
  { name: 'TOTEXP_LAG', selected: true, importance: 0.156 },
  { name: 'ADSMOK42', selected: true, importance: 0.098 },
  { name: 'BMINDX53', selected: true, importance: 0.087 },
  { name: 'DIABDX', selected: true, importance: 0.076 },
  { name: 'HIBPDX', selected: true, importance: 0.065 },
  { name: 'AGE', selected: true, importance: 0.054 },
  { name: 'PHYEXE53', selected: false, importance: 0.032 },
  { name: 'CHOLCK53', selected: false, importance: 0.028 },
];

const confusionMatrix = {
  tp: 4821,
  fp: 611,
  fn: 423,
  tn: 6992
};

const Scoring = () => {
  const [target, setTarget] = useState('classification');
  const [model, setModel] = useState('minimal');
  const [featureSet, setFeatureSet] = useState('reduced');
  const [bootstrapEnabled, setBootstrapEnabled] = useState(true);
  const [bootstrapCount, setBootstrapCount] = useState([100]);
  const [isScoring, setIsScoring] = useState(false);
  const [hasResults, setHasResults] = useState(true);

  const handleScore = () => {
    setIsScoring(true);
    setTimeout(() => {
      setIsScoring(false);
      setHasResults(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Model Scoring</h1>
        <p className="text-muted-foreground mt-1">Run ML models and generate risk scores for members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scoring Configuration</CardTitle>
            <CardDescription>Configure model and feature settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prediction Target */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Prediction Target</Label>
              <RadioGroup value={target} onValueChange={setTarget}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classification" id="classification" />
                  <Label htmlFor="classification" className="text-sm font-normal">
                    Classification (Low-risk label)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regression" id="regression" />
                  <Label htmlFor="regression" className="text-sm font-normal">
                    Regression (TOTEXP)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Model Type</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal Structure (Research)</SelectItem>
                  <SelectItem value="logistic">Logistic Regression / GLM</SelectItem>
                  <SelectItem value="gbm">Gradient Boosting</SelectItem>
                  <SelectItem value="rf">Random Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feature Set */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Feature Set</Label>
              <Select value={featureSet} onValueChange={setFeatureSet}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduced">Reduced Behavior-First (8 features)</SelectItem>
                  <SelectItem value="behavior_clinical">Behavior + Clinical (12 features)</SelectItem>
                  <SelectItem value="behavior_util">Behavior + Utilization (15 features)</SelectItem>
                  <SelectItem value="full">Full Feature Set (47 features)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bootstrap Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Bootstrap Uncertainty</Label>
                <Switch checked={bootstrapEnabled} onCheckedChange={setBootstrapEnabled} />
              </div>
              {bootstrapEnabled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Iterations</span>
                    <span className="font-medium">{bootstrapCount[0]}</span>
                  </div>
                  <Slider
                    value={bootstrapCount}
                    onValueChange={setBootstrapCount}
                    min={50}
                    max={500}
                    step={50}
                  />
                </div>
              )}
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
            <CardTitle className="text-base">Model Performance</CardTitle>
            <CardDescription>Classification metrics for current model</CardDescription>
          </CardHeader>
          <CardContent>
            {hasResults ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">0.891</p>
                  <p className="text-xs text-muted-foreground mt-1">AUC-ROC</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">0.824</p>
                  <p className="text-xs text-muted-foreground mt-1">F1 Score</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">88.7%</p>
                  <p className="text-xs text-muted-foreground mt-1">Precision</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">91.9%</p>
                  <p className="text-xs text-muted-foreground mt-1">Recall</p>
                </div>
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
                <CardTitle className="text-base">Calibration Curve</CardTitle>
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

          {/* Minimal Structure Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Minimum Predictive Structure Selected</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">The smallest feature subset that retains 94% of full-model performance, validating the behavior-first hypothesis.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>8 features retain 94% of full-model performance (ΔAUC = -0.012)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {minimalStructureFeatures.map((feature) => (
                  <div 
                    key={feature.name}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      feature.selected 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-muted/30 border-border opacity-50'
                    }`}
                  >
                    <div>
                      <p className="font-mono text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(feature.importance * 100).toFixed(1)}%
                      </p>
                    </div>
                    {feature.selected ? (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Performance Comparison</p>
                  <p className="text-xs text-muted-foreground">Reduced vs Full Model</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reduced:</span>
                    <span className="font-mono font-medium ml-2">AUC 0.879</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Full:</span>
                    <span className="font-mono font-medium ml-2">AUC 0.891</span>
                  </div>
                  <Badge variant="secondary">Δ -0.012</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

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
