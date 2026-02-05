import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ======================================================
   Types
====================================================== */

export interface SegmentSummary {
  id: number;
  name: string;
  size: number;
  pct: number;
  meanCost: number;
  variance: number;
  catastrophicRate: number;
  avgRiskScore: number;
}

/* ======================================================
   Component
====================================================== */

interface Props {
  segments: SegmentSummary[];
  onSelect?: (segment: SegmentSummary) => void;
}

export function SegmentSummaryTable({ segments, onSelect }: Props) {
  if (!segments.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No segmentation results available
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Segment</TableHead>
          <TableHead className="text-right">Size</TableHead>
          <TableHead className="text-right">Mean Cost</TableHead>
          <TableHead className="text-right">Variance</TableHead>
          <TableHead className="text-right">Catastrophic</TableHead>
          <TableHead className="text-right">Avg Risk</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>

      <TableBody>
        {segments.map((s) => (
          <TableRow
            key={s.id}
            className="hover:bg-muted/50 cursor-pointer"
            onClick={() => onSelect?.(s)}
          >
            <TableCell className="font-medium">{s.name}</TableCell>

            <TableCell className="text-right">
              {s.size.toLocaleString()}
              <span className="ml-1 text-xs text-muted-foreground">
                ({s.pct}%)
              </span>
            </TableCell>

            <TableCell className="text-right font-mono">
              ${s.meanCost.toLocaleString()}
            </TableCell>

            <TableCell className="text-right font-mono">
              ${s.variance.toLocaleString()}
            </TableCell>

            <TableCell className="text-right">
              <Badge variant="outline">
                {s.catastrophicRate}%
              </Badge>
            </TableCell>

            <TableCell className="text-right font-mono">
              {s.avgRiskScore}
            </TableCell>

            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}