import * as React from 'react';

export function ProfileTimeline() {
  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <div className="relative flex flex-col items-center">
          <div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
          <div className="w-px h-full bg-border absolute top-4 bottom-[-32px]" />
        </div>
        <div className="pb-8">
          <p className="text-sm font-medium">Record Created</p>
          <p className="text-sm text-muted-foreground">Profile was initialized in the system.</p>
          <span className="text-xs text-muted-foreground mt-1 block">Just now</span>
        </div>
      </div>
    </div>
  );
}
