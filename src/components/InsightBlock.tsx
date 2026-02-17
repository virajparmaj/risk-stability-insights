import { CardDescription } from "@/components/ui/card";

interface InsightBlockProps {
  title?: string;
  lines: string[];
  emptyMessage?: string;
  className?: string;
}

export function InsightBlock({
  title = "Insights",
  lines,
  emptyMessage = "Upload and score data to see insights.",
  className = "",
}: InsightBlockProps) {
  return (
    <div className={`rounded-md border bg-muted/20 p-3 ${className}`}>
      <CardDescription className="text-xs font-medium text-foreground mb-2">
        {title}
      </CardDescription>

      {lines.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1">
          {lines.map((line, idx) => (
            <li key={`${title}-${idx}`} className="text-xs text-muted-foreground">
              - {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
