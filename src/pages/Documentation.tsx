import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Database, Brain, Shield } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { fetchModelCard, ModelCard } from "@/services/api";
import { toast } from "sonner";
import { getFeatureLabel } from "@/lib/featureLabels";
import { exportFeatureDictionary } from "@/lib/exportCsv";
import { computeRunSummary, groupRequiredFeatures } from "@/lib/analytics";
import { InsightBlock } from "@/components/InsightBlock";

const Documentation = () => {
  const { currentRun } = useData();
  const [modelCard, setModelCard] = useState<ModelCard | null>(
    currentRun?.modelCard ?? null
  );

  useEffect(() => {
    if (currentRun?.modelCard) {
      setModelCard(currentRun.modelCard);
      return;
    }

    fetchModelCard()
      .then(setModelCard)
      .catch(() => toast.error("Failed to load model metadata"));
  }, [currentRun]);

  const summary = useMemo(
    () => (currentRun ? computeRunSummary(currentRun) : null),
    [currentRun]
  );

  const groupedFeatures = useMemo(
    () => (modelCard ? groupRequiredFeatures(modelCard.required_features) : {}),
    [modelCard]
  );

  const modelInsightLines = useMemo(() => {
    if (!modelCard) return [];

    const groups = Object.entries(groupedFeatures)
      .filter(([, features]) => features.length > 0)
      .sort((a, b) => b[1].length - a[1].length);

    const largestGroup = groups[0];
    const lines = [
      `Deployed model is ${modelCard.model_name} ${modelCard.version} with target ${modelCard.target}.`,
      `${modelCard.required_features.length} required features are validated and aligned before scoring.`,
    ];

    if (largestGroup) {
      lines.push(
        `Largest input family is ${largestGroup[0]} (${largestGroup[1].length} features), indicating where most signal comes from structurally.`
      );
    }

    if (summary) {
      lines.push(
        `Current run scored ${summary.nMembers.toLocaleString()} members with ${currentRun?.dataQuality.replacedValueCount.toLocaleString() ?? "0"} coerced values during schema alignment.`
      );
    }

    return lines.slice(0, 6);
  }, [currentRun?.dataQuality.replacedValueCount, groupedFeatures, modelCard, summary]);

  if (!modelCard) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading model documentation...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Model & Feature Documentation
          </h1>
          <p className="text-muted-foreground mt-1">
            Metadata and required schema from the deployed model card
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportFeatureDictionary(
              modelCard.required_features,
              `${modelCard.model_name}_feature_dictionary.csv`
            )
          }
        >
          <Download className="h-4 w-4" />
          Export Feature Dictionary
        </Button>
      </div>

      <InsightBlock title="Model Insights" lines={modelInsightLines} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Model</p>
            <p className="text-lg font-semibold mt-1">{modelCard.model_name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="text-lg font-semibold mt-1">{modelCard.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-lg font-semibold mt-1">{modelCard.target}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Required Features</p>
            <p className="text-lg font-semibold mt-1">
              {modelCard.required_features.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Deployed Model Card
          </CardTitle>
          <CardDescription>
            Live metadata returned by backend model-card endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Model Name</p>
            <p className="font-medium mt-1">{modelCard.model_name}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium mt-1">{modelCard.version}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="font-medium mt-1">{modelCard.target}</p>
          </div>
          {modelCard.deployment_notes && modelCard.deployment_notes.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground mb-2">Deployment Notes</p>
              <div className="flex flex-wrap gap-2">
                {modelCard.deployment_notes.map((note) => (
                  <Badge key={note} variant="outline">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Feature Groups (Heuristic)
          </CardTitle>
          <CardDescription>
            Required features grouped for readability of what the model consumes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupedFeatures)
            .filter(([, features]) => features.length > 0)
            .map(([group, features]) => (
              <div key={group} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{group}</p>
                  <Badge variant="outline">{features.length} features</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {features
                    .slice(0, 8)
                    .map((feature) => `${getFeatureLabel(feature)} (${feature})`)
                    .join(", ")}
                  {features.length > 8 ? `, +${features.length - 8} more` : ""}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Required Feature Schema
          </CardTitle>
          <CardDescription>
            Upload validation and scoring require these exact fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature Code</TableHead>
                <TableHead>Display Label</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelCard.required_features.map((feature) => (
                <TableRow key={feature}>
                  <TableCell className="font-mono text-xs">{feature}</TableCell>
                  <TableCell>{getFeatureLabel(feature)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Governance Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Uploaded cohorts are batch-scored against the deployed artifact and are
            not used to retrain this model in the application.
          </p>
          <p>
            Validation diagnostics (missing columns and coerced values) are persisted
            with each run and exported through Reports.
          </p>
          <p>
            Any policy restrictions on feature use must be enforced in the model
            artifact lifecycle and backend deployment controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documentation;
