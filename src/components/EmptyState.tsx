import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-lg border border-dashed p-12 text-center ${className}`}
    >
      {Icon && (
        <Icon className="h-10 w-10 text-muted-foreground/40 mx-auto" />
      )}
      <p className="text-sm font-medium text-muted-foreground mt-3">
        {title}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      {action && (
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
