import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { offerApi } from '../api/offer.api';
import { toast } from 'sonner';

export const useOffer = () => {
  const queryClient = useQueryClient();

  const useOffers = (candidateId: string) => useQuery({
    queryKey: ['candidates', candidateId, 'offers'],
    queryFn: () => offerApi.list(candidateId),
    enabled: !!candidateId,
  });

  const generateOffer = useMutation({
    mutationFn: offerApi.generate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId] });
      toast.success('Offer generated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to generate offer');
    }
  });

  const acceptOffer = useMutation({
    mutationFn: offerApi.accept,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId] });
      toast.success('Offer accepted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept offer');
    }
  });

  const rejectOffer = useMutation({
    mutationFn: offerApi.reject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'offers'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.candidateId] });
      toast.success('Offer rejected successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reject offer');
    }
  });

  return {
    useOffers,
    generateOffer,
    acceptOffer,
    rejectOffer,
  };
};
