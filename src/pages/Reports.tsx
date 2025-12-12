import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Image, 
  FileArchive,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';

const reportSections = [
  { id: 1, title: 'Executive Summary', status: 'complete', pages: 2 },
  { id: 2, title: 'Data & Variables', status: 'complete', pages: 4 },
  { id: 3, title: 'Methodology', status: 'complete', pages: 6 },
  { id: 4, title: 'Model Performance', status: 'complete', pages: 5 },
  { id: 5, title: 'Segmentation Results', status: 'complete', pages: 8 },
  { id: 6, title: 'Low-Risk Profile Analysis', status: 'complete', pages: 4 },
  { id: 7, title: 'Risk & Volatility', status: 'complete', pages: 5 },
  { id: 8, title: 'Pricing Scenarios', status: 'complete', pages: 3 },
  { id: 9, title: 'Fairness Assessment', status: 'complete', pages: 4 },
  { id: 10, title: 'Discussion & Limitations', status: 'complete', pages: 3 },
  { id: 11, title: 'Appendices', status: 'complete', pages: 12 },
];

const exportOptions = [
  {
    title: 'Scored Dataset',
    description: 'Full member dataset with risk scores and segment assignments',
    format: 'CSV',
    size: '4.2 MB',
    icon: FileSpreadsheet,
  },
  {
    title: 'Segment Summary',
    description: 'Aggregate statistics for each risk segment',
    format: 'CSV',
    size: '48 KB',
    icon: FileSpreadsheet,
  },
  {
    title: 'Full Research Report',
    description: 'Complete analysis report with all sections and visualizations',
    format: 'PDF',
    size: '2.8 MB',
    icon: FileText,
  },
  {
    title: 'Executive Summary',
    description: 'One-page summary for stakeholders',
    format: 'PDF',
    size: '320 KB',
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
    description: 'Trained model files, feature weights, and configuration',
    format: 'ZIP',
    size: '12.1 MB',
    icon: FileArchive,
  },
];

const recentExports = [
  { name: 'Research_Report_v2.3.1.pdf', date: 'Dec 10, 2024 14:32', size: '2.8 MB' },
  { name: 'Scored_Dataset_run001.csv', date: 'Dec 10, 2024 14:30', size: '4.2 MB' },
  { name: 'Segment_Analysis.csv', date: 'Dec 9, 2024 16:45', size: '48 KB' },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground mt-1">Generate research-ready outputs and export data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Research Report Preview</CardTitle>
              <CardDescription>56 pages • Generated from current run</CardDescription>
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
              <p className="text-sm text-muted-foreground text-center mb-4">
                Low-Risk Health-Care Member Identification Using Reduced Behavioral Features
              </p>
              <Separator className="my-4" />
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <p>Model Version: v2.3.1-stable</p>
                <p>Dataset: MEPS_2022_Sample.csv (N=12,847)</p>
                <p>Generated: December 10, 2024</p>
              </div>
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
