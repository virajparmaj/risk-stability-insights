import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, BookOpen, Database, Brain, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const modelCards = [
  {
    name: 'B3_chronic XGBoost (Production)',
    type: 'XGBoost Classifier',
    target: 'P(LOW_RISK=1)',
    features: 12,
    auc: 0.77,
    training: 'MEPS HC-251 (2023)',
    calibrated: true,
    isProduction: true,
    file: 'low_risk_model_B3_chronic_xgb.joblib',
  },
  {
    name: 'B0: Behavior Only (Benchmark)',
    type: 'XGBoost Classifier',
    target: 'P(LOW_RISK=1)',
    features: 2,
    auc: 0.58,
    training: 'MEPS HC-251 (2023)',
    calibrated: false,
    isProduction: false,
    warning: 'Insufficient for stable segmentation',
  },
  {
    name: 'B5: Non-label Utilization (Benchmark)',
    type: 'XGBoost Classifier',
    target: 'P(LOW_RISK=1)',
    features: 18,
    auc: 0.84,
    training: 'MEPS HC-251 (2023)',
    calibrated: true,
    isProduction: false,
    warning: 'Outcome-proximal, not deployable',
  },
];

const featureDictionary = [
  { variable: 'PHYEXE53', meaning: 'Physical exercise frequency', type: 'Ordinal (1-5)', missing: '4.3%', block: 'Behavior' },
  { variable: 'OFTSMK53', meaning: 'Smoking frequency', type: 'Ordinal', missing: '2.1%', block: 'Behavior' },
  { variable: 'RTHLTH53', meaning: 'Self-rated health status', type: 'Ordinal (1-5)', missing: '0.8%', block: 'Mental Health' },
  { variable: 'MNHLTH53', meaning: 'Mental health status', type: 'Ordinal (1-5)', missing: '0.9%', block: 'Mental Health' },
  { variable: 'K6SUM42', meaning: 'Kessler-6 psychological distress sum', type: 'Continuous (0-24)', missing: '4.2%', block: 'Mental Health' },
  { variable: 'PHQ242', meaning: 'PHQ-2 depression screener sum', type: 'Continuous (0-6)', missing: '3.8%', block: 'Mental Health' },
  { variable: 'WLKLIM53', meaning: 'Walking limitation flag', type: 'Binary', missing: '1.2%', block: 'Functional' },
  { variable: 'ACTLIM53', meaning: 'Activity limitation flag', type: 'Binary', missing: '1.1%', block: 'Functional' },
  { variable: 'SOCLIM53', meaning: 'Social limitation flag', type: 'Binary', missing: '1.3%', block: 'Functional' },
  { variable: 'COGLIM53', meaning: 'Cognitive limitation flag', type: 'Binary', missing: '1.0%', block: 'Functional' },
  { variable: 'DIABDX_M18', meaning: 'Diabetes diagnosis (ever)', type: 'Binary', missing: '0.5%', block: 'Chronic' },
  { variable: 'HIBPDX', meaning: 'High blood pressure diagnosis (ever)', type: 'Binary', missing: '0.6%', block: 'Chronic' },
];

const forbiddenPredictors = [
  { variable: 'TOTEXP23', reason: 'Label-defining: used to define LOW_RISK threshold (bottom 30%)' },
  { variable: 'ERTOT23', reason: 'Label-defining: LOW_RISK requires ERTOT23=0' },
  { variable: 'IPDIS23', reason: 'Label-defining: LOW_RISK requires IPDIS23=0' },
  { variable: 'TOTEXP22', reason: 'Prior-year expenditure is outcome-proximal' },
  { variable: 'ERTOT22', reason: 'Prior-year ER visits is outcome-proximal' },
  { variable: 'OBTOT23', reason: 'Current-year outpatient visits too proximal' },
  { variable: 'RXTOT23', reason: 'Current-year Rx fills too proximal' },
];

const modelLadder = [
  { block: 'B0', name: 'Behavior Only', features: 'PHYEXE53, OFTSMK53', auc: 0.58, stable: false, note: 'Insufficient' },
  { block: 'B1', name: 'B0 + Mental Health', features: '+ RTHLTH/MNHLTH/K6/PHQ2', auc: 0.68, stable: false, note: 'Improved but unstable' },
  { block: 'B2', name: 'B0 + Functional', features: '+ WLKLIM/ACTLIM/SOCLIM/COGLIM', auc: 0.65, stable: false, note: 'Marginal gains' },
  { block: 'B3', name: 'B1 + B2 + Chronic', features: '+ DIABDX/HIBPDX/CHDDX', auc: 0.77, stable: true, note: 'STABILITY BREAKPOINT' },
  { block: 'B4', name: 'B3 + SES/Demographics', features: '+ Age/Sex/Poverty/Insurance', auc: 0.78, stable: true, note: 'Marginal improvement' },
  { block: 'B5', name: 'B4 + Non-label Utilization', features: '+ OPTOT/RXTOT/etc.', auc: 0.84, stable: true, note: 'NOT DEPLOYABLE' },
];

const Documentation = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Model & Feature Documentation</h1>
          <p className="text-muted-foreground mt-1">B3_chronic production model documentation aligned with MEPS 2023</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Full Docs
        </Button>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models" className="gap-2">
            <Brain className="h-4 w-4" />
            Model Cards
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Database className="h-4 w-4" />
            Feature Dictionary
          </TabsTrigger>
          <TabsTrigger value="rationale" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Research Rationale
          </TabsTrigger>
          <TabsTrigger value="leakage" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Leakage Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {modelCards.map((model, index) => (
            <Card key={index} className={model.isProduction ? 'border-primary/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {model.name}
                      {model.isProduction && (
                        <Badge variant="default" className="bg-risk-low text-risk-low-foreground">Production</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{model.type}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {model.calibrated && (
                      <Badge variant="default" className="bg-risk-low text-risk-low-foreground">Calibrated</Badge>
                    )}
                    <Badge variant="outline">{model.features} features</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="text-sm font-medium mt-1">{model.target}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">AUC-ROC</p>
                    <p className="text-sm font-medium mt-1">{model.auc}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Training Data</p>
                    <p className="text-sm font-medium mt-1">{model.training}</p>
                  </div>
                  {model.file && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Model File</p>
                      <p className="text-sm font-mono mt-1 truncate">{model.file}</p>
                    </div>
                  )}
                </div>

                {model.warning && (
                  <div className="mt-4 p-3 bg-uncertainty/10 border border-uncertainty/30 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-uncertainty shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{model.warning}</p>
                  </div>
                )}

                {model.isProduction && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="limitations">
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-uncertainty" />
                          Known Limitations
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Behavior features are sparse in MEPS HC-251 2023: only PHYEXE53 and OFTSMK53 available.</li>
                          <li>K6SUM42 and PHQ242 have 3-4% missingness; imputation strategy affects edge cases.</li>
                          <li>Model assumes stable healthcare patterns; major policy changes may affect predictions.</li>
                          <li>Not validated for individual underwriting; intended for population analytics only.</li>
                          <li>LOW_RISK label based on TOTEXP23/ERTOT23/IPDIS23 which are never used as predictors.</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">B3_chronic Feature Dictionary</CardTitle>
              <CardDescription>12 features used in production model</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Variable</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Type</TableHead>
                    <TableHead className="w-[80px] text-right">Missing</TableHead>
                    <TableHead className="w-[100px] text-center">Block</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureDictionary.map((feature) => (
                    <TableRow key={feature.variable}>
                      <TableCell className="font-mono text-sm font-medium">{feature.variable}</TableCell>
                      <TableCell className="text-sm">{feature.meaning}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{feature.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{feature.missing}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={
                            feature.block === 'Behavior'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : feature.block === 'Mental Health'
                                ? 'bg-chart-2/10 text-chart-2 border-chart-2/30'
                                : feature.block === 'Functional'
                                  ? 'bg-chart-3/10 text-chart-3 border-chart-3/30'
                                  : 'bg-chart-4/10 text-chart-4 border-chart-4/30'
                          }
                        >
                          {feature.block}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rationale" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Research Question</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "Can low-risk health-care members be reliably identified using a reduced, behavior-oriented feature set, 
                and what is the <strong>minimum predictive structure</strong> needed to stabilize cost-risk segmentation under uncertainty?"
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why B3 is Deployed (Not B0 or B5)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-risk-high/10 border border-risk-high/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-risk-high" />
                    <span className="font-medium">B0: Behavior Only</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AUC 0.58 — Insufficient for stable segmentation. Only 2 features (PHYEXE53, OFTSMK53) cannot capture risk adequately.
                  </p>
                </div>
                <div className="p-4 bg-risk-low/10 border border-risk-low/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-risk-low" />
                    <span className="font-medium">B3: Chronic (Production)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AUC 0.77 — Minimum stable structure. Combines behavior + mental health + functional + chronic features.
                  </p>
                </div>
                <div className="p-4 bg-uncertainty/10 border border-uncertainty/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-uncertainty" />
                    <span className="font-medium">B5: Utilization</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AUC 0.84 — More accurate but uses outcome-proximal features. Not deployable due to leakage risk.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Model Ladder: B0 → B5</CardTitle>
              <CardDescription>Stability breakpoint identified at B3</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Features Added</TableHead>
                    <TableHead className="text-right">AUC</TableHead>
                    <TableHead className="text-center">Stable?</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelLadder.map((row) => (
                    <TableRow key={row.block} className={row.block === 'B3' ? 'bg-primary/5' : ''}>
                      <TableCell className="font-mono font-medium">{row.block}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.features}</TableCell>
                      <TableCell className="text-right font-mono">{row.auc.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {row.stable ? (
                          <CheckCircle className="h-4 w-4 text-risk-low mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-risk-high mx-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.block === 'B3' ? 'default' : row.block === 'B5' ? 'destructive' : 'secondary'} className="text-xs">
                          {row.note}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leakage">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-risk-high" />
                Forbidden Predictors (Leakage Rules)
              </CardTitle>
              <CardDescription>Variables that must NEVER be used as predictors for LOW_RISK scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Variable</TableHead>
                    <TableHead>Reason for Exclusion</TableHead>
                    <TableHead className="w-[100px] text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forbiddenPredictors.map((item) => (
                    <TableRow key={item.variable}>
                      <TableCell className="font-mono font-medium text-risk-high">{item.variable}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="text-xs">FORBIDDEN</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-risk-high/10 border border-risk-high/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-risk-high shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Critical: Label Leakage Prevention</p>
                    <p className="text-muted-foreground">
                      LOW_RISK is defined using TOTEXP23, ERTOT23, and IPDIS23. Using these variables (or their proxies) as predictors 
                      would create label leakage, artificially inflating model performance and making predictions unusable.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
