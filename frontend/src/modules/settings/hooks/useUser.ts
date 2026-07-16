import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user.api';

export const useUser = () => {
  const useMe = () => useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => userApi.getMe(),
  });

  const useUserById = (id: string) => useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });

  return {
    useMe,
    useUserById,
  };
};
