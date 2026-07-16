import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '../api/candidate.api';
import { profileApi } from '../../profile/api/profile.api';
import { toast } from 'sonner';
import { CreateCandidateFormData } from '../schemas';

export const useCandidate = () => {
  const queryClient = useQueryClient();

  const useCandidates = (params?: any) => useQuery({
    queryKey: ['candidates', params],
    queryFn: () => candidateApi.list(params),
  });

  const useCandidateDetail = (id: string) => useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidateApi.getOne(id),
    enabled: !!id,
  });

  // Composite creation: Create Profile (mock) -> Create Candidate
  const createCandidate = useMutation({
    mutationFn: async (data: CreateCandidateFormData) => {
      // 1. Create Profile first
      const { id: profileId } = await profileApi.createProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });

      // 2. Create Candidate linking to profile
      return candidateApi.create({
        profileId,
        source: data.source,
        referredBy: data.referredBy,
        notes: data.notes,
        appliedDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create candidate');
    }
  });

  const submitCandidate = useMutation({
    mutationFn: candidateApi.submit,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate submitted for review');
    }
  });

  const convertCandidate = useMutation({
    mutationFn: candidateApi.convert,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      // Invalidate employees since a new one was created
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Candidate successfully converted to Employee');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Conversion failed');
    }
  });

  const useCandidateTimeline = (id: string) => useQuery({
    queryKey: ['candidates', id, 'timeline'],
    queryFn: () => candidateApi.getTimeline(id),
    enabled: !!id,
  });

  return {
    useCandidates,
    useCandidateDetail,
    useCandidateTimeline,
    createCandidate,
    submitCandidate,
    convertCandidate,
  };
};
