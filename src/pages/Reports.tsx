import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Image, 
  FileArchive,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const reportSections = [
  { id: 1, title: 'Executive Summary', status: 'complete', pages: 2 },
  { id: 2, title: 'Research Question & Context', status: 'complete', pages: 3 },
  { id: 3, title: 'Data: MEPS HC-251 (2023)', status: 'complete', pages: 4 },
  { id: 4, title: 'Methodology: B3_chronic Model', status: 'complete', pages: 5 },
  { id: 5, title: 'Model Ladder (B0→B5) Analysis', status: 'complete', pages: 6 },
  { id: 6, title: 'Bootstrap Stability Evidence', status: 'complete', pages: 5 },
  { id: 7, title: 'Low-Risk Segment Profile', status: 'complete', pages: 4 },
  { id: 8, title: 'Pricing Scenarios', status: 'complete', pages: 3 },
  { id: 9, title: 'Fairness Assessment', status: 'complete', pages: 4 },
  { id: 10, title: 'Conclusions & Limitations', status: 'complete', pages: 3 },
  { id: 11, title: 'Appendices', status: 'complete', pages: 10 },
];

const modelLadderSummary = [
  { block: 'B0', features: 2, auc: 0.58, stable: 'No', deployed: 'No' },
  { block: 'B1', features: 6, auc: 0.68, stable: 'No', deployed: 'No' },
  { block: 'B2', features: 6, auc: 0.65, stable: 'No', deployed: 'No' },
  { block: 'B3', features: 12, auc: 0.77, stable: 'Yes', deployed: 'YES (Production)' },
  { block: 'B4', features: 16, auc: 0.78, stable: 'Yes', deployed: 'No' },
  { block: 'B5', features: 18, auc: 0.84, stable: 'Yes', deployed: 'No (Proximal)' },
];

const exportOptions = [
  {
    title: 'Scored Dataset',
    description: 'Full member dataset with B3 risk scores and segment assignments',
    format: 'CSV',
    size: '4.2 MB',
    icon: FileSpreadsheet,
  },
  {
    title: 'Segment Summary',
    description: 'Aggregate statistics for predicted low-risk vs non-low-risk',
    format: 'CSV',
    size: '48 KB',
    icon: FileSpreadsheet,
  },
  {
    title: 'Full Research Report',
    description: 'Complete analysis with model ladder, bootstrap evidence, and B3 decision rationale',
    format: 'PDF',
    size: '3.2 MB',
    icon: FileText,
  },
  {
    title: 'Executive Summary',
    description: 'One-page summary for stakeholders with key findings',
    format: 'PDF',
    size: '380 KB',
    icon: FileText,
  },
  {
    title: 'All Figures',
    description: 'High-resolution exports of all charts and visualizations',
    format: 'ZIP',
    size: '18.4 MB',
    icon: Image,
  },
  {
    title: 'Model Artifacts',
    description: 'B3_chronic joblib model file and configuration',
    format: 'ZIP',
    size: '12.1 MB',
    icon: FileArchive,
  },
];

const recentExports = [
  { name: 'B3_Research_Report_v1.0.pdf', date: 'Dec 13, 2024 10:32', size: '3.2 MB' },
  { name: 'Scored_Dataset_B3_run001.csv', date: 'Dec 13, 2024 10:30', size: '4.2 MB' },
  { name: 'Bootstrap_Stability_Analysis.csv', date: 'Dec 12, 2024 16:45', size: '128 KB' },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Generate research-ready outputs with model ladder and bootstrap evidence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Research Report Preview</CardTitle>
              <CardDescription>49 pages • B3_chronic Production Analysis</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="font-serif text-lg font-semibold text-center mb-1">
                Profit-Stabilization-Predictive-Risk-Retention
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-2">
                Minimum Predictive Structure for Low-Risk Member Identification
              </p>
              <p className="text-xs text-center text-muted-foreground mb-4">
                MEPS HC-251 (2023) | B3_chronic XGBoost Model
              </p>
              <Separator className="my-4" />
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <p>Model: low_risk_model_B3_chronic_xgb.joblib</p>
                <p>Data: MEPS HC-251 2023 (N=12,847)</p>
                <p>Generated: December 13, 2024</p>
              </div>
            </div>

            {/* Model Ladder Summary */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                Model Ladder Summary (B0→B5)
                <Badge variant="outline" className="text-xs">Included in Report</Badge>
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Features</TableHead>
                    <TableHead className="text-right">AUC</TableHead>
                    <TableHead className="text-center">Stable</TableHead>
                    <TableHead>Deployed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelLadderSummary.map((row) => (
                    <TableRow key={row.block} className={row.block === 'B3' ? 'bg-primary/5' : ''}>
                      <TableCell className="font-mono font-medium">{row.block}</TableCell>
                      <TableCell className="text-right">{row.features}</TableCell>
                      <TableCell className="text-right font-mono">{row.auc.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {row.stable === 'Yes' ? (
                          <CheckCircle className="h-4 w-4 text-risk-low mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.deployed.includes('YES') ? (
                          <Badge variant="default" className="bg-risk-low text-risk-low-foreground text-xs">
                            Production
                          </Badge>
                        ) : row.deployed.includes('Proximal') ? (
                          <Badge variant="outline" className="text-xs bg-uncertainty/10 text-uncertainty border-uncertainty/30">
                            Not Deployable
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.deployed}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Table of Contents</h4>
              <div className="space-y-1">
                {reportSections.map((section) => (
                  <div 
                    key={section.id}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{section.id}.</span>
                      <span className="text-sm">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {section.pages} pages
                      </Badge>
                      <CheckCircle className="h-4 w-4 text-risk-low" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Exports */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exportOptions.slice(0, 3).map((option) => (
                <div 
                  key={option.title}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <option.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{option.title}</p>
                      <p className="text-xs text-muted-foreground">{option.format} • {option.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Exports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentExports.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {file.date}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Findings for Report */}
      <Card className="bg-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">Report Key Findings</CardTitle>
          <CardDescription>Auto-included in generated report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-medium mb-2">Bootstrap Stability Evidence</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AUC Mean: 0.77 (SD: 0.018, CV: 2.3%)</li>
                <li>• Segment Size: 32.1% (SD: 2.1%)</li>
                <li>• Jaccard Overlap: 88%</li>
                <li>• Stability breakpoint confirmed at B3</li>
              </ul>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <h4 className="font-medium mb-2">Final Decision</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• B3_chronic deployed for production scoring</li>
                <li>• B0 insufficient (AUC 0.58)</li>
                <li>• B5 not deployable (outcome-proximal)</li>
                <li>• Research question validated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Export Options</CardTitle>
          <CardDescription>Download data, reports, and model artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportOptions.map((option) => (
              <div 
                key={option.title}
                className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{option.title}</p>
                      <Badge variant="secondary" className="text-xs">{option.format}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{option.size}</span>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
