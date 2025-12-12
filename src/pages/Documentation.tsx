import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Download, BookOpen, Database, Brain, AlertCircle } from 'lucide-react';

const modelCards = [
  {
    name: 'Minimal Structure Classifier',
    type: 'Logistic Regression (GLM)',
    target: 'Low-Risk Binary Label',
    features: 8,
    auc: 0.879,
    training: 'MEPS 2019-2021 (N=38,421)',
    calibrated: true,
  },
  {
    name: 'Full Feature Classifier',
    type: 'Gradient Boosting',
    target: 'Low-Risk Binary Label',
    features: 47,
    auc: 0.891,
    training: 'MEPS 2019-2021 (N=38,421)',
    calibrated: true,
  },
  {
    name: 'Cost Regression Model',
    type: 'Random Forest',
    target: 'TOTEXP (log-transformed)',
    features: 47,
    auc: null,
    rmse: 0.842,
    training: 'MEPS 2019-2021 (N=38,421)',
    calibrated: false,
  },
];

const featureDictionary = [
  { variable: 'ERTOT', meaning: 'Emergency room visits total', type: 'Count', missing: '0.2%', importance: 'High' },
  { variable: 'IPDIS', meaning: 'Inpatient discharges', type: 'Count', missing: '0.1%', importance: 'High' },
  { variable: 'TOTEXP_LAG', meaning: 'Prior year total expenditure', type: 'Continuous', missing: '8.4%', importance: 'High' },
  { variable: 'ADSMOK42', meaning: 'Current smoking status', type: 'Binary', missing: '2.1%', importance: 'Medium' },
  { variable: 'BMINDX53', meaning: 'Body Mass Index', type: 'Continuous', missing: '3.2%', importance: 'Medium' },
  { variable: 'DIABDX', meaning: 'Diabetes diagnosis', type: 'Binary', missing: '0.8%', importance: 'Medium' },
  { variable: 'HIBPDX', meaning: 'High blood pressure diagnosis', type: 'Binary', missing: '0.9%', importance: 'Medium' },
  { variable: 'AGE', meaning: 'Age in years', type: 'Continuous', missing: '0.0%', importance: 'Low' },
  { variable: 'PHYEXE53', meaning: 'Physical exercise frequency', type: 'Ordinal', missing: '4.3%', importance: 'Low' },
  { variable: 'CHOLCK53', meaning: 'Cholesterol check in past year', type: 'Binary', missing: '1.8%', importance: 'Low' },
];

const Documentation = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Model & Feature Documentation</h1>
          <p className="text-muted-foreground mt-1">Technical documentation, model cards, and feature dictionary</p>
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
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {modelCards.map((model, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{model.name}</CardTitle>
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
                    <p className="text-xs text-muted-foreground">{model.auc ? 'AUC-ROC' : 'RMSE'}</p>
                    <p className="text-sm font-medium mt-1">{model.auc || model.rmse}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Training Data</p>
                    <p className="text-sm font-medium mt-1">{model.training}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Feature Count</p>
                    <p className="text-sm font-medium mt-1">{model.features} variables</p>
                  </div>
                </div>

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
                        <li>Model trained on historical MEPS data; performance may degrade on populations with different demographic distributions.</li>
                        <li>Self-reported behavioral variables (smoking, exercise) may contain measurement error.</li>
                        <li>Prior-year expenditure (TOTEXP_LAG) has 8.4% missingness, imputed using multiple imputation.</li>
                        <li>Model assumes stable healthcare utilization patterns; major policy changes may affect predictions.</li>
                        <li>Not validated for individual-level underwriting decisions; intended for population analytics only.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Dictionary</CardTitle>
              <CardDescription>Complete variable definitions and metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Variable</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[80px] text-right">Missing</TableHead>
                    <TableHead className="w-[100px] text-center">Importance</TableHead>
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
                            feature.importance === 'High'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : feature.importance === 'Medium'
                                ? 'bg-chart-2/10 text-chart-2 border-chart-2/30'
                                : 'bg-muted'
                          }
                        >
                          {feature.importance}
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
                and what is the minimum predictive structure needed to stabilize cost-risk segmentation under uncertainty?"
              </blockquote>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why Behavior-First?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Traditional risk adjustment models rely heavily on clinical diagnoses and utilization history. 
                While predictive, these approaches have limitations for prospective risk identification:
              </p>
              <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Lag Effect:</strong> Diagnoses only appear after conditions manifest, 
                  limiting early intervention opportunities.
                </li>
                <li>
                  <strong className="text-foreground">Selection Bias:</strong> Utilization-based features may reflect access 
                  barriers rather than underlying health status.
                </li>
                <li>
                  <strong className="text-foreground">Modifiability:</strong> Behavioral factors (smoking, exercise, diet) 
                  are potentially modifiable through wellness programs, enabling proactive risk management.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                This research tests whether a parsimonious model emphasizing behavioral indicators can match 
                the predictive performance of complex clinical models while offering greater interpretability 
                and actionability for retention strategies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Minimum Predictive Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A key contribution of this work is identifying the <em>minimal feature set</em> that retains 
                near-full-model predictive power. Through systematic ablation analysis:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">8</p>
                  <p className="text-sm text-muted-foreground mt-1">Features in minimal set</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">94%</p>
                  <p className="text-sm text-muted-foreground mt-1">Performance retained</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">-0.012</p>
                  <p className="text-sm text-muted-foreground mt-1">ΔAUC vs full model</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This demonstrates that stable low-risk identification does not require the full complexity 
                of comprehensive risk adjustment systems, supporting more efficient and interpretable 
                underwriting and population health management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ablation Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sequential feature removal demonstrates diminishing returns beyond the top 8 predictors:
              </p>
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
                <pre className="overflow-x-auto">
{`Feature Set Size    AUC      ΔAUC
────────────────────────────────────
Full (47)          0.891     —
Top 20             0.889    -0.002
Top 15             0.886    -0.005
Top 10             0.882    -0.009
Top 8*             0.879    -0.012  ← Selected
Top 6              0.861    -0.030
Top 4              0.823    -0.068

* Minimal set balances parsimony with performance`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
