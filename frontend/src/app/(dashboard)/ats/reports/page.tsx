import { CandidateReports } from '@/modules/candidate/components/reports/CandidateReports';
import { PermissionGuard } from '@/modules/auth/components/PermissionGuard';

export default function AtsReportsPage() {
  return (
    <PermissionGuard permissions={['Candidate.Report']}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <CandidateReports />
      </div>
    </PermissionGuard>
  );
}
