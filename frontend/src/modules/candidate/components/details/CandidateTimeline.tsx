'use client';

import * as React from 'react';
import { useCandidate } from '../../hooks/useCandidate';
import { CandidateTimelineEvent } from '../../types';

export function CandidateTimeline({ candidateId }: { candidateId: string }) {
  const { useCandidateTimeline } = useCandidate();
  const { data: timeline = [], isLoading } = useCandidateTimeline(candidateId);

  if (isLoading) return <div className="p-4">Loading timeline...</div>;

  if (timeline.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No events found.</div>;
  }

  return (
    <div className="space-y-8 p-4">
      {timeline.map((event: CandidateTimelineEvent, idx: number) => (
        <div key={event.id} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="h-4 w-4 rounded-full border-2 border-primary bg-background" />
            {idx < timeline.length - 1 && (
              <div className="w-px h-full bg-border absolute top-4 bottom-[-32px]" />
            )}
          </div>
          <div className="pb-8">
            <p className="text-sm font-medium">{event.title}</p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <span className="text-xs text-muted-foreground mt-1 block">
              {new Date(event.createdAt).toLocaleString()} by {event.createdBy}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
