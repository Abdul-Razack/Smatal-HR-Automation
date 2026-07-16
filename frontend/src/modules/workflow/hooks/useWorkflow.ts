import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../api/workflow.api';
import { toast } from 'sonner';

export const useWorkflow = () => {
  const queryClient = useQueryClient();

  const useWorkflows = () => useQuery({
    queryKey: ['workflows'],
    queryFn: workflowApi.listWorkflows,
  });

  const useWorkflowDetail = (id: string) => useQuery({
    queryKey: ['workflows', id],
    queryFn: () => workflowApi.getWorkflow(id),
    enabled: !!id,
  });

  const createWorkflow = useMutation({
    mutationFn: workflowApi.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create workflow');
    }
  });

  const addStage = useMutation({
    mutationFn: workflowApi.addStage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', variables.workflowId] });
      toast.success('Stage added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add stage');
    }
  });

  const publishWorkflow = useMutation({
    mutationFn: workflowApi.publishWorkflow,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', id] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow published');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to publish workflow');
    }
  });

  return {
    useWorkflows,
    useWorkflowDetail,
    createWorkflow,
    addStage,
    publishWorkflow,
  };
};
