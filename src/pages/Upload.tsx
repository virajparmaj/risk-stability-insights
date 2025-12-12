import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Search,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sampleDatasets = [
  { name: 'MEPS_2022_Sample.csv', records: 12847, size: '4.2 MB' },
  { name: 'MEPS_2021_Full.csv', records: 28934, size: '9.8 MB' },
  { name: 'Demo_Small.csv', records: 1000, size: '320 KB' },
];

const validationResults = [
  { check: 'Required columns present', status: 'pass', details: 'All 47 required columns found' },
  { check: 'No duplicate DUPERSID', status: 'pass', details: '0 duplicates detected' },
  { check: 'Age range valid (0-100)', status: 'pass', details: 'All values in range' },
  { check: 'BMI values valid', status: 'warning', details: '23 records with BMI > 60' },
  { check: 'Missingness check', status: 'warning', details: '3.2% missing values across dataset' },
  { check: 'Categorical encoding', status: 'pass', details: 'All categorical values valid' },
];

const previewData = [
  { DUPERSID: '100001', AGE: 45, SEX: 'M', BMINDX53: 28.4, TOTEXP: 3421, ERTOT: 0, IPDIS: 0 },
  { DUPERSID: '100002', AGE: 67, SEX: 'F', BMINDX53: 31.2, TOTEXP: 12890, ERTOT: 2, IPDIS: 1 },
  { DUPERSID: '100003', AGE: 32, SEX: 'M', BMINDX53: 24.1, TOTEXP: 890, ERTOT: 0, IPDIS: 0 },
  { DUPERSID: '100004', AGE: 55, SEX: 'F', BMINDX53: null, TOTEXP: 8234, ERTOT: 1, IPDIS: 0 },
  { DUPERSID: '100005', AGE: 28, SEX: 'M', BMINDX53: 22.8, TOTEXP: 456, ERTOT: 0, IPDIS: 0 },
];

const qualityMetrics = [
  { name: 'Completeness', score: 96.8, color: 'bg-risk-low' },
  { name: 'Consistency', score: 98.2, color: 'bg-risk-low' },
  { name: 'Validity', score: 91.4, color: 'bg-chart-4' },
  { name: 'Duplicates', score: 100, color: 'bg-risk-low' },
];

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [hasFile, setHasFile] = useState(true); // Demo mode with file loaded
  const [searchTerm, setSearchTerm] = useState('');

  const overallScore = Math.round(qualityMetrics.reduce((sum, m) => sum + m.score, 0) / qualityMetrics.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload & Validate Data</h1>
        <p className="text-muted-foreground mt-1">Import MEPS-derived member data and run quality checks</p>
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
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Download Template</p>
                  <p className="text-xs text-muted-foreground">MEPS-compatible CSV template with all required columns</p>
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
            <CardDescription>Overall data health assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-risk-low/10 border-4 border-risk-low">
                <span className="text-3xl font-bold text-risk-low">{overallScore}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">out of 100</p>
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
            <CardDescription>Automated data quality and consistency checks</CardDescription>
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
              <CardDescription>First 100 rows of uploaded dataset</CardDescription>
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
                    <TableHead className="font-mono text-xs">AGE</TableHead>
                    <TableHead className="font-mono text-xs">SEX</TableHead>
                    <TableHead className="font-mono text-xs">BMINDX53</TableHead>
                    <TableHead className="font-mono text-xs">TOTEXP</TableHead>
                    <TableHead className="font-mono text-xs">ERTOT</TableHead>
                    <TableHead className="font-mono text-xs">IPDIS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row) => (
                    <TableRow key={row.DUPERSID}>
                      <TableCell className="font-mono text-xs">{row.DUPERSID}</TableCell>
                      <TableCell className="text-sm">{row.AGE}</TableCell>
                      <TableCell className="text-sm">{row.SEX}</TableCell>
                      <TableCell className="text-sm">
                        {row.BMINDX53 === null ? (
                          <Badge variant="outline" className="text-xs bg-uncertainty/10">Missing</Badge>
                        ) : row.BMINDX53}
                      </TableCell>
                      <TableCell className="text-sm">${row.TOTEXP.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{row.ERTOT}</TableCell>
                      <TableCell className="text-sm">{row.IPDIS}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Button */}
      {hasFile && (
        <div className="flex justify-end">
          <Button size="lg" className="gap-2">
            Confirm & Create Run
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Upload;
