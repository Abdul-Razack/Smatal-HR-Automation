import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workflowInstanceApi } from '../api/workflowInstance.api';
import { toast } from 'sonner';

export const useWorkflowInstance = () => {
  const queryClient = useQueryClient();

  const useWorkflowInstances = (params?: any) => useQuery({
    queryKey: ['workflow-instances', params],
    queryFn: () => workflowInstanceApi.list(params),
  });

  const useWorkflowInstanceDetail = (id: string) => useQuery({
    queryKey: ['workflow-instances', id],
    queryFn: () => workflowInstanceApi.getOne(id),
    enabled: !!id,
  });

  const useWorkflowHistory = (id: string) => useQuery({
    queryKey: ['workflow-instances', id, 'history'],
    queryFn: () => workflowInstanceApi.getHistory(id),
    enabled: !!id,
  });

  const invalidateWorkflow = (id: string) => {
    queryClient.invalidateQueries({ queryKey: ['workflow-instances', id] });
    queryClient.invalidateQueries({ queryKey: ['workflow-instances', id, 'history'] });
    queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
  };

  const approve = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => workflowInstanceApi.approve(id, remarks),
    onSuccess: (_, variables) => {
      invalidateWorkflow(variables.id);
      toast.success('Stage approved successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to approve stage')
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => workflowInstanceApi.reject(id, reason),
    onSuccess: (_, variables) => {
      invalidateWorkflow(variables.id);
      toast.success('Stage rejected');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to reject stage')
  });

  const returnStage = useMutation({
    mutationFn: ({ id, targetStageId, reason }: { id: string; targetStageId: string; reason: string }) => workflowInstanceApi.returnToStage(id, targetStageId, reason),
    onSuccess: (_, variables) => {
      invalidateWorkflow(variables.id);
      toast.success('Workflow returned to previous stage');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to return workflow')
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => workflowInstanceApi.cancel(id, reason),
    onSuccess: (_, variables) => {
      invalidateWorkflow(variables.id);
      toast.success('Workflow cancelled');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to cancel workflow')
  });

  return {
    useWorkflowInstances,
    useWorkflowInstanceDetail,
    useWorkflowHistory,
    approve,
    reject,
    returnStage,
    cancel,
  };
};
