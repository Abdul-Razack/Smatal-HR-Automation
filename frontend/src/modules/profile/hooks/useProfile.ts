import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';

export const useProfile = () => {
  const queryClient = useQueryClient();

  const useProfileDetail = (id: string) => useQuery({
    queryKey: ['profiles', id],
    queryFn: () => profileApi.getProfile(id),
    enabled: !!id,
  });

  const createProfile = useMutation({
    mutationFn: profileApi.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  return {
    useProfileDetail,
    createProfile,
  };
};
