import { CardDescription } from "@/components/ui/card";
import { useRole } from "@/contexts/RoleContext";

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
  const { role } = useRole();
  const isCustomer = role === "customer";

  const simplifyLine = (line: string): string => {
    const firstSentence = line.split(".")[0]?.trim() ?? line;
    return firstSentence
      .replace(/\bprobability\b/gi, "score")
      .replace(/\bcohort\b/gi, "member group")
      .replace(/\bcatastrophic\b/gi, "very high-cost")
      .replace(/Spearman[^,.;)]*/gi, "rank-correlation");
  };

  const visibleLines = isCustomer
    ? lines.slice(0, 3).map(simplifyLine)
    : lines;
  const visibleTitle = isCustomer && title === "Insights" ? "Key Takeaways" : title;

  return (
    <div className={`rounded-md border bg-muted/20 p-3 ${className}`}>
      <CardDescription className="text-xs font-medium text-foreground mb-2">
        {visibleTitle}
      </CardDescription>

      {visibleLines.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1">
          {visibleLines.map((line, idx) => (
            <li key={`${visibleTitle}-${idx}`} className="text-xs text-muted-foreground">
              - {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
