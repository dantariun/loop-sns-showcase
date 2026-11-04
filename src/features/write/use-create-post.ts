import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import { useFeedScroll } from '@/features/feed/feed-scroll';
import { parseHashtags } from './hashtags';

interface SubmitArgs {
  media: string[];
  body: string;
  locationTag: string | null;
}

/**
 * 게시물 등록.
 *
 * 낙관적 추가는 하지 않는다 — 새 글은 id 를 서버가 정하고 피드 맨 앞에
 * 끼어들어야 해서, 임시 id 로 먼저 그리면 되돌릴 때 순서가 틀어진다.
 * 대신 등록 성공 시 피드·내 프로필 그리드를 무효화한다.
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ media, body, locationTag }: SubmitArgs) =>
      repositories.feed.createPost({
        mediaIds: media,
        body: body.trim(),
        hashtags: parseHashtags(body),
        locationTag,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.all });
      queryClient.invalidateQueries({ queryKey: qk.users.me() });
      // 새 글이 화면 위로 밀려 가려지지 않도록 피드를 맨 위로 올린다
      useFeedScroll.getState().requestScrollTop();
    },
  });
}
