import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications.list(),
    queryFn: () => repositories.notifications.notifications(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: qk.notifications.unreadCount(),
    queryFn: () => repositories.notifications.unreadCount(),
  });
}

/** 활동 탭에 들어오면 호출한다 — 탭 배지가 같이 사라진다 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repositories.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}
