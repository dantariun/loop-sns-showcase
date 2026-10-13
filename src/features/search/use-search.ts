import { useQuery } from '@tanstack/react-query';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';

export function useTrendingTags() {
  return useQuery({
    queryKey: qk.search.trending(),
    queryFn: () => repositories.search.trendingTags(),
  });
}

export function useSuggestedUsers() {
  return useQuery({
    queryKey: qk.search.suggested(),
    queryFn: () => repositories.search.suggestedUsers(),
  });
}

export function useExplore() {
  return useQuery({
    queryKey: qk.search.explore(),
    queryFn: () => repositories.search.explore(),
  });
}

/** 검색어가 비면 질의하지 않는다 — 빈 요청으로 캐시를 더럽히지 않기 위해 */
export function useUserSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: qk.search.users(q),
    queryFn: () => repositories.search.searchUsers(q),
    enabled: q.length > 0,
  });
}

export function usePostSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: qk.search.posts(q),
    queryFn: () => repositories.search.searchPosts(q),
    enabled: q.length > 0,
  });
}
