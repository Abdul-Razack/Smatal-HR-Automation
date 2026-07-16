import * as React from 'react';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export function NotFoundPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
        <p className="mt-4 text-muted-foreground max-w-[500px] text-center">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link 
        href="/"
        className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
      >
        Return Home
      </Link>
    </div>
  );
}
