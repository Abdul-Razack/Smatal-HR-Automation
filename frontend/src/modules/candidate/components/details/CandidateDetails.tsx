'use client';

import * as React from 'react';
import { useCandidate } from '../../hooks/useCandidate';
import { ProfileLayout } from '@/modules/profile/components/layout/ProfileLayout';
import { ProfileOverview } from '@/modules/profile/components/widgets/ProfileOverview';
import { ProfileTimeline } from '@/modules/profile/components/widgets/ProfileTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, UserCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useModalStore } from '@/shared/modals/useModalStore';
import { CandidateConvertForm } from '../forms/CandidateConvertForm';
import { Card } from '@/components/ui/card';
import { ProfileDocumentsTab } from '@/modules/document/components/details/ProfileDocumentsTab';
import { InterviewList } from '../interview/InterviewList';
import { OfferList } from '../offer/OfferList';
import { CandidateTimeline } from './CandidateTimeline';

export function CandidateDetails({ candidateId }: { candidateId: string }) {
  const { useCandidateDetail, submitCandidate } = useCandidate();
  const { data: candidate, isLoading } = useCandidateDetail(candidateId);
  const openModal = useModalStore((state) => state.openModal);

  // Fallbacks if candidate endpoints aren't strictly typed/implemented yet
  const screenCmd = React.useCallback(() => {
    // API might not exist yet, fallback placeholder
    console.log('Screen');
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!candidate) return <div>Candidate not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/candidates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {candidate.profile?.firstName || 'Unknown'} {candidate.profile?.lastName}
          </h2>
          <p className="text-muted-foreground">Candidate Reference: {candidate.id}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            Status: {candidate.status}
          </Badge>

          {candidate.status === 'DRAFT' && (
            <Button onClick={() => submitCandidate.mutate(candidate.id)}>Submit Application</Button>
          )}

          {candidate.status === 'SELECTED' && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => openModal({
                id: 'convert-candidate',
                type: 'side-panel',
                title: 'Convert to Employee',
                content: <CandidateConvertForm candidateId={candidate.id} />,
              })}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Convert to Employee
            </Button>
          )}
        </div>
      </div>

      <ProfileLayout 
        overviewTab={<ProfileOverview profile={candidate.profile} />}
        timelineTab={<CandidateTimeline candidateId={candidate.id} />}
        dynamicFieldsTab={
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Candidate Information</h3>
            <div className="text-muted-foreground text-sm">Dynamic fields integration placeholder. Will use DynamicFormRenderer.</div>
          </div>
        }
        documentsTab={<ProfileDocumentsTab entityType="candidate" entityId={candidate.id} profileId={candidate.profileId} />}
        workflowTab={
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Workflow Actions</h3>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => screenCmd()}>Move to Screening</Button>
              <Button variant="outline" className="text-green-600 border-green-200">Move to Interview</Button>
              <Button variant="outline" className="text-destructive border-red-200">Reject</Button>
            </div>
          </Card>
        }
        customTabs={[
          {
            value: 'interviews',
            label: 'Interviews',
            content: <div className="p-6"><InterviewList candidateId={candidate.id} /></div>
          },
          {
            value: 'offers',
            label: 'Offers',
            content: <div className="p-6"><OfferList candidateId={candidate.id} /></div>
          }
        ]}
      />
    </div>
  );
}
