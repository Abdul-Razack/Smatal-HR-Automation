import { CandidateDetails } from '@/modules/candidate/components/details/CandidateDetails';

export default function CandidateDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CandidateDetails candidateId={params.id} />
    </div>
  );
}
