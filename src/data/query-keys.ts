/**
 * 쿼리 키 단일 출처.
 *
 * 문자열을 화면에 흩어두면 무효화 대상이 조용히 어긋난다.
 * 계층 구조라 `qk.posts.all` 하나로 그 아래를 통째로 무효화할 수 있다.
 */
export const qk = {
  posts: {
    all: ['posts'] as const,
    feed: () => [...qk.posts.all, 'feed'] as const,
    detail: (id: string) => [...qk.posts.all, 'detail', id] as const,
    byUser: (userId: string) => [...qk.posts.all, 'by-user', userId] as const,
    bookmarks: () => [...qk.posts.all, 'bookmarks'] as const,
    comments: (postId: string) => [...qk.posts.all, 'comments', postId] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => [...qk.users.all, 'me'] as const,
    detail: (id: string) => [...qk.users.all, 'detail', id] as const,
    suggestions: () => [...qk.users.all, 'suggestions'] as const,
    followers: (id: string) => [...qk.users.all, 'followers', id] as const,
    following: (id: string) => [...qk.users.all, 'following', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => [...qk.notifications.all, 'list'] as const,
    unreadCount: () => [...qk.notifications.all, 'unread-count'] as const,
  },
  chat: {
    all: ['chat'] as const,
    threads: () => [...qk.chat.all, 'threads'] as const,
    messages: (threadId: string) => [...qk.chat.all, 'messages', threadId] as const,
  },
  search: {
    all: ['search'] as const,
    trending: () => [...qk.search.all, 'trending'] as const,
    suggested: () => [...qk.search.all, 'suggested'] as const,
    explore: () => [...qk.search.all, 'explore'] as const,
    users: (q: string) => [...qk.search.all, 'users', q] as const,
    posts: (q: string) => [...qk.search.all, 'posts', q] as const,
  },
} as const;
