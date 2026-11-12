import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import type { AppNotification } from '@/entities';

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

/**
 * 목록 캐시를 먼저 바꾸고 미읽음 수를 거기서 다시 센다.
 *
 * 미읽음 수는 목록에서 파생되는 값이라, 서버를 다시 부르면
 * 두 쿼리가 잠깐 어긋난 상태로 화면에 보인다 — 뱃지가 늦게 줄어든다.
 */
function patchList(
  queryClient: ReturnType<typeof useQueryClient>,
  update: (list: AppNotification[]) => AppNotification[],
) {
  const next = queryClient.setQueryData<AppNotification[]>(qk.notifications.list(), (old) =>
    old ? update(old) : old,
  );
  if (next) {
    queryClient.setQueryData(qk.notifications.unreadCount(), next.filter((n) => !n.read).length);
  }
}

/** 알림 한 건 읽음 — 목록에서 눌렀을 때 */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.notifications.markRead(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.notifications.all });
      const snapshot = queryClient.getQueriesData({ queryKey: qk.notifications.all });

      patchList(queryClient, (list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

      return { snapshot };
    },

    onError: (_err, _id, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
  });
}

/** 모두 읽음 — 상단 액션 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repositories.notifications.markAllRead(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: qk.notifications.all });
      const snapshot = queryClient.getQueriesData({ queryKey: qk.notifications.all });

      patchList(queryClient, (list) => list.map((n) => (n.read ? n : { ...n, read: true })));

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
  });
}

/**
 * 알림 삭제 — 스와이프.
 *
 * 낙관적으로 먼저 지운다. 행이 즉시 사라지지 않으면 스와이프가
 * 되감기는 것처럼 보여, 삭제가 실패한 줄 알게 된다.
 */
export function useRemoveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.notifications.remove(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.notifications.all });
      const snapshot = queryClient.getQueriesData({ queryKey: qk.notifications.all });

      patchList(queryClient, (list) => list.filter((n) => n.id !== id));

      return { snapshot };
    },

    onError: (_err, _id, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
  });
}
