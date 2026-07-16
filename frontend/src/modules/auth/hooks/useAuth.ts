import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { LoginFormData } from '../schemas/login.schema';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login: storeLogin, logout: storeLogout, status } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => authApi.login(credentials),
    onSuccess: (data) => {
      // Data usually has { accessToken, refreshToken, user, company (optional) }
      // The backend structure might differ, so we map it appropriately based on AuthResponseDto
      // For now, assuming standard structure.
      storeLogin({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        roles: data.user.roles || [],
        permissions: data.user.permissions || [],
      });
      toast.success('Successfully logged in');
      router.push('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    status,
    isAuthenticated: status === 'authenticated',
  };
};

export const useCurrentUser = () => {
  return useAuthStore((state) => state.currentUser);
};

export const useCurrentCompany = () => {
  return useAuthStore((state) => state.currentCompany);
};

export const usePermissions = () => {
  return useAuthStore((state) => state.permissions);
};

export const useHasPermission = (permission: string) => {
  const permissions = usePermissions();
  return permissions.includes(permission);
};

export const useHasRole = (role: string) => {
  const roles = useAuthStore((state) => state.roles);
  return roles.includes(role);
};
