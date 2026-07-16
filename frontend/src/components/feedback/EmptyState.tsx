import * as React from 'react';
import { FolderX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No Data Found',
  description = 'There is currently no data to display here.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] border rounded-lg border-dashed bg-card/50", className)}>
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted text-muted-foreground">
        {icon || <FolderX className="w-6 h-6" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="max-w-sm mb-4 text-sm text-muted-foreground">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
