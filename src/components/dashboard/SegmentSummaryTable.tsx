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

interface Props {
  segments: SegmentSummary[];
  onSelect?: (segment: SegmentSummary) => void;
  selectedSegmentId?: number;
}

export function SegmentSummaryTable({
  segments,
  onSelect,
  selectedSegmentId,
}: Props) {
  if (!segments.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Upload and score data to see insights.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Segment</TableHead>
          <TableHead className="text-right">Members</TableHead>
          <TableHead className="text-right">Mean Risk</TableHead>
          <TableHead className="text-right">Mean Cost</TableHead>
          <TableHead className="text-right">Cost Variance</TableHead>
          <TableHead className="text-right">Catastrophic</TableHead>
          <TableHead className="text-right">Details</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {segments.map((segment) => {
          const isSelected = selectedSegmentId === segment.id;
          return (
            <TableRow
              key={segment.id}
              className={`cursor-pointer ${isSelected ? "bg-muted/60" : "hover:bg-muted/40"}`}
              onClick={() => onSelect?.(segment)}
            >
              <TableCell className="font-medium">{segment.name}</TableCell>

              <TableCell className="text-right">
                {segment.size.toLocaleString()}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({segment.pct.toFixed(1)}%)
                </span>
              </TableCell>

              <TableCell className="text-right font-mono">
                {segment.avgRiskScore.toFixed(3)}
              </TableCell>

              <TableCell className="text-right font-mono">
                ${Math.round(segment.meanCost).toLocaleString()}
              </TableCell>

              <TableCell className="text-right font-mono">
                ${Math.round(segment.variance).toLocaleString()}
              </TableCell>

              <TableCell className="text-right">
                <Badge variant="outline">{segment.catastrophicRate.toFixed(2)}%</Badge>
              </TableCell>

              <TableCell className="text-right">
                <Button variant={isSelected ? "secondary" : "ghost"} size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
