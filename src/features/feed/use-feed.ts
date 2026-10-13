import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import type { Post } from '@/entities';

export function useFeed() {
  return useQuery({
    queryKey: qk.posts.feed(),
    queryFn: () => repositories.feed.feed(),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: qk.posts.detail(id),
    queryFn: () => repositories.feed.post(id),
    enabled: Boolean(id),
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: qk.posts.comments(postId),
    queryFn: () => repositories.feed.comments(postId),
    enabled: Boolean(postId),
  });
}

/**
 * 게시물이 들어 있을 수 있는 모든 캐시에 같은 변경을 적용한다.
 *
 * 한 게시물이 피드·상세·프로필 그리드·북마크에 동시에 떠 있을 수 있어,
 * 한 곳만 고치면 탭을 옮겼을 때 좋아요가 되돌아간 것처럼 보인다.
 */
function patchPostEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  patch: (post: Post) => Post,
) {
  queryClient.setQueriesData<Post[]>({ queryKey: qk.posts.all }, (old) =>
    Array.isArray(old) ? old.map((p) => (p.id === postId ? patch(p) : p)) : old,
  );
  queryClient.setQueryData<Post | null>(qk.posts.detail(postId), (old) => (old ? patch(old) : old));
}

/** 좋아요 토글 — 응답을 기다리지 않고 먼저 반영하고, 실패하면 되돌린다 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => repositories.feed.toggleLike(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: qk.posts.all });
      const snapshot = queryClient.getQueriesData<Post[]>({ queryKey: qk.posts.all });

      patchPostEverywhere(queryClient, postId, (p) => ({
        ...p,
        liked: !p.liked,
        likeCount: p.likeCount + (p.liked ? -1 : 1),
      }));

      return { snapshot };
    },

    onError: (_err, _postId, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
  });
}

/** 북마크 토글 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => repositories.feed.toggleBookmark(postId),

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: qk.posts.all });
      const snapshot = queryClient.getQueriesData<Post[]>({ queryKey: qk.posts.all });

      patchPostEverywhere(queryClient, postId, (p) => ({ ...p, bookmarked: !p.bookmarked }));

      return { snapshot };
    },

    onError: (_err, _postId, context) => {
      for (const [key, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(key, data);
      }
    },

    // 북마크 목록은 구성이 바뀌므로 서버 기준으로 다시 받는다
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.bookmarks() });
    },
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => repositories.feed.addComment(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.comments(postId) });
      patchPostEverywhere(queryClient, postId, (p) => ({
        ...p,
        commentCount: p.commentCount + 1,
      }));
    },
  });
}

export function usePostsBy(userId: string) {
  return useQuery({
    queryKey: qk.posts.byUser(userId),
    queryFn: () => repositories.feed.postsBy(userId),
    enabled: Boolean(userId),
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: qk.posts.bookmarks(),
    queryFn: () => repositories.feed.bookmarks(),
  });
}
