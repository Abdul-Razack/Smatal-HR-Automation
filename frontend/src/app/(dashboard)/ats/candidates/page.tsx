import { CandidateList } from '@/modules/candidate/components/list/CandidateList';

export default function CandidatesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CandidateList />
    </div>
  );
}
