import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tooltip?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  tooltip,
  trend,
  trendValue,
  variant = 'default',
  icon,
  className
}: KPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-l-4 border-l-risk-low border-t-0 border-r-0 border-b-0',
    warning: 'border-l-4 border-l-uncertainty border-t-0 border-r-0 border-b-0',
    danger: 'border-l-4 border-l-risk-high border-t-0 border-r-0 border-b-0'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className={cn('bg-card', variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        
        <div className="mt-2 flex items-end gap-2">
          <span className="text-2xl font-semibold text-foreground">{value}</span>
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-sm mb-0.5',
              trend === 'up' && 'text-risk-low',
              trend === 'down' && 'text-risk-high',
              trend === 'neutral' && 'text-muted-foreground'
            )}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
