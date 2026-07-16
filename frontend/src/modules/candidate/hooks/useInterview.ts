import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { interviewApi } from '../api/interview.api';
import { toast } from 'sonner';
import { Interview } from '../types';

export const useInterview = () => {
  const queryClient = useQueryClient();

  const useInterviews = (candidateId: string) => useQuery({
    queryKey: ['candidates', candidateId, 'interviews'],
    queryFn: () => interviewApi.list(candidateId),
    enabled: !!candidateId,
  });

  const scheduleInterview = useMutation({
    mutationFn: interviewApi.schedule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'timeline'] });
      toast.success('Interview scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to schedule interview');
    }
  });

  const cancelInterview = useMutation({
    mutationFn: interviewApi.cancel,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'timeline'] });
      toast.success('Interview cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel interview');
    }
  });

  const submitFeedback = useMutation({
    mutationFn: interviewApi.submitFeedback,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'timeline'] });
      toast.success('Feedback submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit feedback');
    }
  });

  return {
    useInterviews,
    scheduleInterview,
    cancelInterview,
    submitFeedback,
  };
};
