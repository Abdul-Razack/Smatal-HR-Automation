'use client';

import * as React from 'react';
import { FileQuestion, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg animate-in fade-in-50">
      <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
        {icon || <FolderOpen className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mt-2 mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
