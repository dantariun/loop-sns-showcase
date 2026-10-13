import { QueryClient } from '@tanstack/react-query';

/**
 * 더미 백엔드에 맞춘 캐시 정책.
 *
 * 데이터가 메모리에 있어 재요청 비용이 사실상 0 이지만, 기본값을 그대로 두면
 * 화면을 옮길 때마다 깜빡인다. staleTime 을 넉넉히 주고 창 포커스 재요청을 끄면
 * 실제 앱과 같은 "한 번 받은 건 바로 보여준다" 감각이 난다.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
