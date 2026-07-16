import * as React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface RetryComponentProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function RetryComponent({ error, resetErrorBoundary }: RetryComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-destructive/10 border-destructive/20 max-w-lg mx-auto mt-8">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-2">Something went wrong!</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {error.message || 'An unexpected error occurred while loading this component.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
