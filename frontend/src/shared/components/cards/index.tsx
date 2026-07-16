import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatisticCardData } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatisticCard({ data, className }: { data: StatisticCardData; className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {data.title}
        </CardTitle>
        {data.icon && <data.icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value}</div>
        <div className="flex items-center mt-1 space-x-2">
          {data.trend && (
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                data.trend === 'up' && "text-green-600",
                data.trend === 'down' && "text-red-600",
                data.trend === 'neutral' && "text-muted-foreground"
              )}
            >
              {data.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3" />}
              {data.trend === 'down' && <TrendingDown className="mr-1 h-3 w-3" />}
              {data.trend === 'neutral' && <Minus className="mr-1 h-3 w-3" />}
              {data.trendValue}
            </span>
          )}
          {data.description && (
            <p className="text-xs text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionCard({ title, description, action, icon: Icon }: { title: string, description: string, action: React.ReactNode, icon?: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {action}
      </CardFooter>
    </Card>
  );
}
