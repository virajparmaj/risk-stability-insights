import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Search,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sampleDatasets = [
  { name: 'MEPS_HC251_2023_Sample.csv', records: 12847, size: '4.2 MB' },
  { name: 'MEPS_HC251_2023_Full.csv', records: 28934, size: '9.8 MB' },
  { name: 'Demo_B3_Compatible.csv', records: 1000, size: '320 KB' },
];

// B3_chronic required columns
const b3RequiredColumns = [
  { name: 'DUPERSID', description: 'Unique person identifier', required: true },
  { name: 'PHYEXE53', description: 'Physical exercise frequency', required: true },
  { name: 'OFTSMK53', description: 'Smoking frequency', required: true },
  { name: 'RTHLTH53', description: 'Self-rated health status', required: true },
  { name: 'MNHLTH53', description: 'Mental health status', required: true },
  { name: 'K6SUM42', description: 'Kessler-6 psychological distress', required: true },
  { name: 'PHQ242', description: 'PHQ-2 depression screener', required: true },
  { name: 'ADGENH42', description: 'General health perception', required: false },
  { name: 'WLKLIM53', description: 'Walking limitation', required: true },
  { name: 'ACTLIM53', description: 'Activity limitation', required: true },
  { name: 'SOCLIM53', description: 'Social limitation', required: true },
  { name: 'COGLIM53', description: 'Cognitive limitation', required: true },
  { name: 'DFHEAR42', description: 'Difficulty hearing', required: false },
  { name: 'DFSEE42', description: 'Difficulty seeing', required: false },
  { name: 'DIABDX_M18', description: 'Diabetes diagnosis', required: true },
  { name: 'HIBPDX', description: 'High blood pressure diagnosis', required: true },
  { name: 'CHDDX', description: 'Coronary heart disease', required: false },
  { name: 'ASTHDX', description: 'Asthma diagnosis', required: false },
  { name: 'ARTHDX', description: 'Arthritis diagnosis', required: false },
];

const validationResults = [
  { check: 'B3_chronic columns present', status: 'pass', details: 'All 12 required B3 columns found' },
  { check: 'No duplicate DUPERSID', status: 'pass', details: '0 duplicates detected' },
  { check: 'PHYEXE53 valid range (1-5)', status: 'pass', details: 'All values in expected range' },
  { check: 'OFTSMK53 valid range', status: 'pass', details: 'All values valid' },
  { check: 'Missingness check', status: 'warning', details: 'K6SUM42: 4.2% missing, PHQ242: 3.8% missing' },
  { check: 'Label columns excluded', status: 'pass', details: 'TOTEXP23, ERTOT23, IPDIS23 not used as predictors' },
];

const previewData = [
  { DUPERSID: '2320001', PHYEXE53: 3, OFTSMK53: 1, RTHLTH53: 2, MNHLTH53: 2, K6SUM42: 4, DIABDX_M18: 0 },
  { DUPERSID: '2320002', PHYEXE53: 5, OFTSMK53: 1, RTHLTH53: 1, MNHLTH53: 1, K6SUM42: 1, DIABDX_M18: 0 },
  { DUPERSID: '2320003', PHYEXE53: 2, OFTSMK53: 3, RTHLTH53: 3, MNHLTH53: 3, K6SUM42: 8, DIABDX_M18: 1 },
  { DUPERSID: '2320004', PHYEXE53: 4, OFTSMK53: 1, RTHLTH53: 2, MNHLTH53: 2, K6SUM42: null, DIABDX_M18: 0 },
  { DUPERSID: '2320005', PHYEXE53: 1, OFTSMK53: 4, RTHLTH53: 4, MNHLTH53: 4, K6SUM42: 12, DIABDX_M18: 1 },
];

const qualityMetrics = [
  { name: 'Completeness', score: 96.8, color: 'bg-risk-low' },
  { name: 'B3 Schema Match', score: 100, color: 'bg-risk-low' },
  { name: 'Value Validity', score: 98.2, color: 'bg-risk-low' },
  { name: 'No Duplicates', score: 100, color: 'bg-risk-low' },
];

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasFile, setHasFile] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumns, setShowColumns] = useState(false);

  const overallScore = Math.round(qualityMetrics.reduce((sum, m) => sum + m.score, 0) / qualityMetrics.length);
  const isProductionReady = overallScore >= 95;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload & Validate Data</h1>
        <p className="text-muted-foreground mt-1">Import MEPS HC-251 2023 data and validate for B3_chronic scoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Upload Dataset</CardTitle>
            <CardDescription>Drag and drop a CSV file or select from sample datasets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Zone */}
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); setHasFile(true); }}
            >
              <UploadIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">MEPS HC-251 2023 format expected</p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>

            {/* B3 Required Columns */}
            <Collapsible open={showColumns} onOpenChange={setShowColumns}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">B3_chronic Required Columns</p>
                      <p className="text-xs text-muted-foreground">12 required + 7 optional columns for production scoring</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showColumns && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded-lg border p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {b3RequiredColumns.map((col) => (
                      <div key={col.name} className="flex items-center gap-2 text-xs">
                        {col.required ? (
                          <CheckCircle className="h-3 w-3 text-risk-low shrink-0" />
                        ) : (
                          <span className="h-3 w-3 rounded-full bg-muted shrink-0" />
                        )}
                        <span className="font-mono">{col.name}</span>
                        <span className="text-muted-foreground truncate">- {col.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Template Download */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Download Template</p>
                  <p className="text-xs text-muted-foreground">B3_chronic compatible CSV template</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Sample Datasets */}
            <div>
              <p className="text-sm font-medium mb-2">Or select a sample dataset:</p>
              <div className="space-y-2">
                {sampleDatasets.map((dataset) => (
                  <div 
                    key={dataset.name}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{dataset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dataset.records.toLocaleString()} records • {dataset.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Select</Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Quality Score</CardTitle>
            <CardDescription>B3_chronic production readiness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-full border-4",
                isProductionReady 
                  ? "bg-risk-low/10 border-risk-low" 
                  : "bg-uncertainty/10 border-uncertainty"
              )}>
                <span className={cn(
                  "text-3xl font-bold",
                  isProductionReady ? "text-risk-low" : "text-uncertainty"
                )}>{overallScore}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">out of 100</p>
              <Badge 
                variant={isProductionReady ? "default" : "secondary"} 
                className={cn(
                  "mt-2",
                  isProductionReady && "bg-risk-low text-risk-low-foreground"
                )}
              >
                {isProductionReady ? "Production Ready" : "Needs Review"}
              </Badge>
            </div>

            <div className="space-y-3">
              {qualityMetrics.map((metric) => (
                <div key={metric.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{metric.name}</span>
                    <span className="font-medium">{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Results */}
      {hasFile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validation Checks</CardTitle>
            <CardDescription>B3_chronic schema and data quality validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {validationResults.map((result, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    result.status === 'pass' && "bg-risk-low/5 border-risk-low/20",
                    result.status === 'warning' && "bg-uncertainty/5 border-uncertainty/20",
                    result.status === 'fail' && "bg-risk-high/5 border-risk-high/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {result.status === 'pass' && <CheckCircle className="h-4 w-4 text-risk-low shrink-0 mt-0.5" />}
                    {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-uncertainty shrink-0 mt-0.5" />}
                    {result.status === 'fail' && <AlertCircle className="h-4 w-4 text-risk-high shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{result.check}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {hasFile && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Data Preview</CardTitle>
              <CardDescription>B3_chronic feature columns (label columns hidden)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px] h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono text-xs">DUPERSID</TableHead>
                    <TableHead className="font-mono text-xs">PHYEXE53</TableHead>
                    <TableHead className="font-mono text-xs">OFTSMK53</TableHead>
                    <TableHead className="font-mono text-xs">RTHLTH53</TableHead>
                    <TableHead className="font-mono text-xs">MNHLTH53</TableHead>
                    <TableHead className="font-mono text-xs">K6SUM42</TableHead>
                    <TableHead className="font-mono text-xs">DIABDX_M18</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row) => (
                    <TableRow key={row.DUPERSID}>
                      <TableCell className="font-mono text-xs">{row.DUPERSID}</TableCell>
                      <TableCell className="text-sm">{row.PHYEXE53}</TableCell>
                      <TableCell className="text-sm">{row.OFTSMK53}</TableCell>
                      <TableCell className="text-sm">{row.RTHLTH53}</TableCell>
                      <TableCell className="text-sm">{row.MNHLTH53}</TableCell>
                      <TableCell className="text-sm">
                        {row.K6SUM42 === null ? (
                          <Badge variant="outline" className="text-xs bg-uncertainty/10">Missing</Badge>
                        ) : row.K6SUM42}
                      </TableCell>
                      <TableCell className="text-sm">{row.DIABDX_M18}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: TOTEXP23, ERTOT23, IPDIS23 are label-defining variables and are excluded from predictor display.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Validation Buttons */}
      {hasFile && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Validate for Research Benchmarks
          </Button>
          <Button size="lg" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Validate for Production (B3)
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Upload;
