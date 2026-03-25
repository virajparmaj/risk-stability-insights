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
    default: 'border-info/20 bg-card',
    success: 'border-risk-low/20 bg-card',
    warning: 'border-uncertainty/25 bg-card',
    danger: 'border-risk-high/25 bg-card'
  };

  const iconStyles = {
    default: 'border-info/20 bg-info/8 text-info',
    success: 'border-risk-low/20 bg-risk-low/10 text-risk-low',
    warning: 'border-uncertainty/25 bg-uncertainty/10 text-uncertainty',
    danger: 'border-risk-high/20 bg-risk-high/10 text-risk-high'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className={cn('rounded-xl shadow-none', variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {title}
              </span>
              {tooltip && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</span>
              {trend && trendValue && (
                <div className={cn(
                  'mb-0.5 flex items-center gap-1 text-sm',
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
              <p className="mt-2 text-sm leading-5 text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {icon && (
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md border', iconStyles[variant])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
