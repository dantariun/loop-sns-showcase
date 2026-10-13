import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import type { User } from '@/entities';

export function useMe() {
  return useQuery({
    queryKey: qk.users.me(),
    queryFn: () => repositories.users.me(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: qk.users.detail(id),
    queryFn: () => repositories.users.user(id),
    enabled: Boolean(id),
  });
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: qk.users.followers(userId),
    queryFn: () => repositories.users.followers(userId),
    enabled: Boolean(userId),
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: qk.users.following(userId),
    queryFn: () => repositories.users.following(userId),
    enabled: Boolean(userId),
  });
}

/**
 * 팔로우 토글.
 *
 * 같은 사용자가 프로필·검색 추천·팔로워 목록에 동시에 떠 있을 수 있어,
 * users 네임스페이스 전체를 훑어 같은 id 를 한 번에 갈아끼운다.
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => repositories.users.toggleFollow(userId),

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: qk.users.all });
      const snapshot = queryClient.getQueriesData({ queryKey: qk.users.all });

      const flip = (u: User): User =>
        u.id === userId
          ? {
              ...u,
              isFollowing: !u.isFollowing,
              followerCount: u.followerCount + (u.isFollowing ? -1 : 1),
            }
          : u;

      queryClient.setQueriesData<User[]>({ queryKey: qk.users.all }, (old) =>
        Array.isArray(old) ? old.map(flip) : old,
      );
      queryClient.setQueryData<User | null>(qk.users.detail(userId), (old) =>
        old ? flip(old) : old,
      );

      return { snapshot };
    },

    onError: (_err, _userId, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },

    // 내 팔로잉 수와 추천 목록 구성은 서버가 정한다
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.users.me() });
      queryClient.invalidateQueries({ queryKey: qk.search.suggested() });
    },
  });
}
