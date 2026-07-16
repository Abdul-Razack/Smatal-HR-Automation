import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/audit.api';

export const useAudit = () => {
  const useAuditHistory = (params?: { entityBusinessId?: string; limit?: number; offset?: number }) => useQuery({
    queryKey: ['audit', params],
    queryFn: () => auditApi.getAuditHistory(params),
  });

  return {
    useAuditHistory,
  };
};
