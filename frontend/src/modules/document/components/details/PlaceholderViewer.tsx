'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Placeholder {
  key: string;
  source: string;
  resolvedValue?: string;
}

export function PlaceholderViewer({ placeholders }: { placeholders: Placeholder[] }) {
  if (!placeholders || placeholders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No dynamic placeholders defined for this template.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Placeholder Resolution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {placeholders.map((p) => (
            <div key={p.key} className="flex justify-between items-center border-b pb-2">
              <div className="flex flex-col">
                <span className="font-mono text-sm">{p.key}</span>
                <span className="text-xs text-muted-foreground">Source: {p.source}</span>
              </div>
              <Badge variant={p.resolvedValue ? 'default' : 'secondary'}>
                {p.resolvedValue ? 'Resolved' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
