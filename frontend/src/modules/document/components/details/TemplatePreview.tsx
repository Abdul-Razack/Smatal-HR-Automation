'use client';

import * as React from 'react';
import { useDocument } from '../../hooks/useDocument';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TemplatePreview({ templateId }: { templateId: string }) {
  const { useTemplate } = useDocument();
  const { data: template, isLoading } = useTemplate(templateId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Template Name</p>
            <p className="font-medium">{template.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Version</p>
            <p className="font-medium text-xs break-all">{template.activeVersionId || 'None'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-sm">{template.description || 'No description provided'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
