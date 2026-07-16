import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';

export const useNotification = () => {
  const queryClient = useQueryClient();

  const useNotifications = (unreadOnly = false) => useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => notificationApi.list({ unreadOnly }),
    refetchInterval: 30000, // Poll every 30s
  });

  const markAsRead = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    useNotifications,
    markAsRead,
  };
};
