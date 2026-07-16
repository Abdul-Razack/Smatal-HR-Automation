'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

export function RouteLoader() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading content...</p>
      </div>
    </div>
  );
}
