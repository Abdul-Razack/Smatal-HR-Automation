import * as React from 'react';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function UnauthorizedPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You do not have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>
      </div>
      <Link 
        href="/"
        className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
