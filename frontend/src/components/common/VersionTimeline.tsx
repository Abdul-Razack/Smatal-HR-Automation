'use client';

import * as React from 'react';
import { TemplateVersionDto } from '@/modules/document/types';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { FileDown, RefreshCcw, CheckCircle2, Trash2 } from 'lucide-react';

interface VersionTimelineProps {
  versions: TemplateVersionDto[];
  onPublish: (versionId: string) => void;
  onRollback: (versionId: string) => void;
  onDownload: (versionId: string) => void;
  onDelete?: (versionId: string) => void;
  isLoading?: boolean;
}

export function VersionTimeline({
  versions,
  onPublish,
  onRollback,
  onDownload,
  onDelete,
  isLoading
}: VersionTimelineProps) {
  if (!versions || versions.length === 0) {
    return <div className="text-muted-foreground text-sm py-4">No versions found.</div>;
  }

  // Sort versions newest first
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {sortedVersions.map((version) => (
        <div key={version.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-background group-[.is-active]:bg-primary text-primary-foreground group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {version.versionNumber}
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between space-x-2 mb-1">
              <div className="font-bold">v{version.versionNumber}.0</div>
              <time className="text-xs text-muted-foreground">
                {version.createdAt && !isNaN(new Date(version.createdAt).getTime()) 
                  ? format(new Date(version.createdAt), 'PPpp') 
                  : 'Date unavailable'}
              </time>
            </div>
            <div className="mb-2">
              <StatusChip status={version.status} />
              {version.importStatus && <StatusChip status={`Import: ${version.importStatus}`} />}
            </div>
            {version.notes && <div className="text-sm text-muted-foreground mb-4">{version.notes}</div>}
            {version.originalFilename && (
              <div className="text-xs font-mono bg-muted p-1 rounded mb-4 truncate">
                {version.originalFilename}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => onDownload(version.id)}>
                <FileDown className="w-4 h-4 mr-1" /> Download
              </Button>
              {version.status === 'DRAFT' && (
                <Button size="sm" onClick={() => onPublish(version.id)} disabled={isLoading}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Publish
                </Button>
              )}
              {version.status === 'PUBLISHED' && sortedVersions[0].id !== version.id && (
                <Button size="sm" variant="secondary" onClick={() => onRollback(version.id)} disabled={isLoading}>
                  <RefreshCcw className="w-4 h-4 mr-1" /> Rollback Here
                </Button>
              )}
              {version.status === 'DRAFT' && onDelete && (
                <Button size="sm" variant="destructive" onClick={() => onDelete(version.id)} disabled={isLoading} aria-label="Delete draft version">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
