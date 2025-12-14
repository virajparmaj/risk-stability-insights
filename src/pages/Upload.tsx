// src/pages/Upload.tsx

import Papa from "papaparse";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { fetchModelCard, scoreBatch } from "@/services/api";
import { toast } from "sonner";

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

import {
  Upload as UploadIcon,
  ShieldCheck,
  FlaskConical,
  ArrowRight,
} from "lucide-react";

/* ======================================================
   Component
====================================================== */

const Upload = () => {
  const { setCurrentRun } = useData();

  const [parsedRows, setParsedRows] = useState<Record<string, any>[] | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ======================================================
     CSV Upload Handler
  ====================================================== */

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          toast.error("CSV appears to be empty");
          return;
        }
        setParsedRows(results.data as Record<string, any>[]);
        toast.success(
          `Loaded ${results.data.length.toLocaleString()} rows`
        );
      },
      error: () => {
        toast.error("Failed to parse CSV");
      },
    });
  };

  /* ======================================================
     Production Validation (REAL MEPS DATA)
  ====================================================== */

  const handleProductionValidation = async () => {
    if (!parsedRows) {
      toast.error("Please upload a MEPS CSV first");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1️⃣ Fetch model schema
      const modelCard = await fetchModelCard();

      // 2️⃣ Build scoring rows using ONLY required features
      const rows = parsedRows.map((r) => {
        const row: Record<string, number> = {};

        modelCard.required_features.forEach((feature) => {
          const v = r[feature];
          row[feature] =
            v === undefined || v === "" || v === null ? 0 : Number(v);
        });

        return row;
      });

      console.log("Example scoring row:", rows[0]);

      // 3️⃣ Score batch
      const scored = await scoreBatch(rows);

      const probs = scored.results.map(
        (r: { low_risk_probability: number }) => r.low_risk_probability
      );

      // 4️⃣ Register run globally
      setCurrentRun({
        id: crypto.randomUUID(),
        datasetName: "MEPS HC-251 (2023)",
        timestamp: new Date().toISOString(),
        modelCard,
        results: scored.results,
        summary: {
          n_members: probs.length,
          mean_probability:
            probs.reduce((a, b) => a + b, 0) / probs.length,
          low_risk_rate:
            probs.filter((p) => p >= 0.7).length / probs.length,
        },
      });

      toast.success("MEPS 2023 scoring complete");
    } catch (err: any) {
      toast.error(err.message || "Scoring failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ======================================================
     Render
  ====================================================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Upload & Validate Data</h1>
        <p className="text-muted-foreground">
          Upload MEPS HC-251 (2023) and run B3_chronic scoring
        </p>
      </div>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload MEPS CSV</CardTitle>
          <CardDescription>
            HC-251 public-use file (2023)
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
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {parsedRows && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>First 5 rows (raw MEPS)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(parsedRows[0]).slice(0, 10).map((k) => (
                    <TableHead key={k} className="font-mono text-xs">
                      {k}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedRows.slice(0, 5).map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row)
                      .slice(0, 10)
                      .map((v, j) => (
                        <TableCell key={j} className="text-xs">
                          {String(v)}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
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
          Validate for Production (B3)
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Upload;