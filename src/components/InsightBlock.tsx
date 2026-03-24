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
  emptyMessage = "No insights available for this view.",
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
    <div className={`rounded-md border border-primary/10 bg-primary/[0.03] p-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {visibleTitle}
      </p>

      {visibleLines.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1 list-disc list-inside">
          {visibleLines.map((line, idx) => (
            <li key={`${visibleTitle}-${idx}`} className="text-xs text-muted-foreground">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
