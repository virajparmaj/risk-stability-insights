// src/pages/Upload.tsx

import Papa from "papaparse";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { fetchModelCard, scoreBatch } from "@/services/api";
import { alignFeatures } from "@/lib/alignFeatures";
import { computeRunAnalytics, DataQualitySummary } from "@/lib/runAnalytics";
import { toast } from "sonner";
import { getFeatureLabel } from "@/lib/featureLabels";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ShieldCheck,
  FlaskConical,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const LOW_RISK_THRESHOLD = 0.7;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const Upload = () => {
  const { setCurrentRun } = useData();

  const [parsedRows, setParsedRows] = useState<Record<string, string>[] | null>(
    null
  );
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] =
    useState<DataQualitySummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          toast.error("CSV appears to be empty");
          return;
        }

        setUploadedFilename(file.name);
        setParsedRows(results.data as Record<string, string>[]);
        setValidationSummary(null);
        toast.success(
          `Loaded ${results.data.length.toLocaleString()} rows from ${file.name}`
        );
      },
      error: () => {
        toast.error("Failed to parse CSV");
      },
    });
  };

  const runSchemaValidation = async () => {
    if (!parsedRows) {
      toast.error("Please upload a MEPS CSV first");
      return null;
    }

    const modelCard = await fetchModelCard();
    const alignment = alignFeatures(parsedRows, modelCard.required_features);

    if (alignment.missingRequiredFeatures.length > 0) {
      const missingPreview = alignment.missingRequiredFeatures
        .slice(0, 8)
        .join(", ");
      toast.error(
        `Missing required columns (${alignment.missingRequiredFeatures.length}): ${missingPreview}`
      );
      return null;
    }

    const dataQuality: DataQualitySummary = {
      rowCount: parsedRows.length,
      requiredFeatureCount: modelCard.required_features.length,
      missingRequiredColumns: alignment.missingRequiredFeatures,
      replacedValueCount: alignment.totalReplacedWithZero,
      replacementStats: alignment.replacementStats,
    };

    setValidationSummary(dataQuality);

    if (dataQuality.replacedValueCount > 0) {
      toast.warning(
        `Validation complete: ${dataQuality.replacedValueCount.toLocaleString()} cells were coerced to 0`
      );
    } else {
      toast.success("Validation complete: no coercions needed");
    }

    return {
      modelCard,
      alignedRows: alignment.rows,
      dataQuality,
    };
  };

  const handleResearchValidation = async () => {
    try {
      setIsSubmitting(true);
      await runSchemaValidation();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Validation failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductionValidation = async () => {
    try {
      setIsSubmitting(true);

      const validation = await runSchemaValidation();
      if (!validation) return;

      const scored = await scoreBatch(validation.alignedRows);
      const probabilities = scored.results.map(
        (row) => row.low_risk_probability
      );

      const analytics = computeRunAnalytics({
        rawRows: parsedRows ?? [],
        alignedRows: validation.alignedRows,
        probabilities,
        threshold: LOW_RISK_THRESHOLD,
      });

      const datasetName =
        uploadedFilename?.replace(/\.[^/.]+$/, "") || "Uploaded_MEPS_Dataset";

      setCurrentRun({
        id: crypto.randomUUID(),
        datasetName,
        sourceFilename: uploadedFilename ?? undefined,
        timestamp: new Date().toISOString(),
        modelCard: validation.modelCard,
        scoredRows: scored.results,
        alignedRows: validation.alignedRows,
        results: scored.results,
        summary: {
          n_members: probabilities.length,
          mean_probability:
            probabilities.reduce((acc, value) => acc + value, 0) /
            Math.max(probabilities.length, 1),
          low_risk_rate:
            probabilities.filter((value) => value >= LOW_RISK_THRESHOLD)
              .length / Math.max(probabilities.length, 1),
        },
        dataQuality: validation.dataQuality,
        analytics,
        sourceRows: parsedRows,
      });

      toast.success(
        `Production scoring complete for ${probabilities.length.toLocaleString()} rows`
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Scoring failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload and Score</h1>
        <p className="text-muted-foreground">
          Upload your MEPS CSV, check required columns, then run scoring
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload MEPS CSV</CardTitle>
          <CardDescription>
            The app checks your file against the deployed model schema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {parsedRows && (
            <p className="text-sm text-muted-foreground">
              {parsedRows.length.toLocaleString()} rows loaded
              {uploadedFilename ? ` (${uploadedFilename})` : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {validationSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {validationSummary.replacedValueCount === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-risk-low" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-uncertainty" />
              )}
              Validation Summary
            </CardTitle>
            <CardDescription>
              Required columns: {validationSummary.requiredFeatureCount} | Rows:{" "}
              {validationSummary.rowCount.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Missing required columns:{" "}
                {validationSummary.missingRequiredColumns.length}
              </Badge>
              <Badge variant="outline">
                Values coerced to 0:{" "}
                {validationSummary.replacedValueCount.toLocaleString()}
              </Badge>
            </div>

            {validationSummary.replacementStats.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead className="text-right">Coerced Cells</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationSummary.replacementStats
                    .slice(0, 8)
                    .map((stat) => (
                      <TableRow key={stat.feature}>
                        <TableCell>
                          {getFeatureLabel(stat.feature)}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({stat.feature})
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.replacedWithZero.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {parsedRows && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>First 5 rows (raw upload)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(parsedRows[0])
                    .slice(0, 10)
                    .map((key) => (
                      <TableHead key={key} className="text-xs">
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            {getFeatureLabel(key)}
                          </TooltipTrigger>
                          <TooltipContent>{key}</TooltipContent>
                        </Tooltip>
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedRows.slice(0, 5).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.values(row)
                      .slice(0, 10)
                      .map((value, cellIndex) => (
                        <TableCell key={cellIndex} className="text-xs">
                          {String(value)}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleResearchValidation}
          disabled={isSubmitting}
        >
          <FlaskConical className="h-4 w-4" />
          Research Validation
        </Button>

        <Button
          size="lg"
          className="gap-2"
          onClick={handleProductionValidation}
          disabled={isSubmitting}
        >
          <ShieldCheck className="h-4 w-4" />
          Score for Production
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Upload;
