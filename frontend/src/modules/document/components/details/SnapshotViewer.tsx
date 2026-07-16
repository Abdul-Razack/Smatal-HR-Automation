'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SnapshotViewer({ snapshotData }: { snapshotData: string }) {
  let parsedSnapshot = {};
  
  try {
    parsedSnapshot = JSON.parse(snapshotData);
  } catch (e) {
    // If not JSON, treat as raw text/html
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Immutable Snapshot</CardTitle>
        <p className="text-sm text-muted-foreground">This data represents the exact state of the entity at the time of generation.</p>
      </CardHeader>
      <CardContent>
        {typeof snapshotData === 'string' && snapshotData.startsWith('{') ? (
          <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[500px]">
            {JSON.stringify(parsedSnapshot, null, 2)}
          </pre>
        ) : (
          <div 
            className="bg-white border rounded-md p-8 min-h-[500px] shadow-sm overflow-auto text-black prose" 
            dangerouslySetInnerHTML={{ __html: snapshotData || 'No snapshot available' }} 
          />
        )}
      </CardContent>
    </Card>
  );
}
