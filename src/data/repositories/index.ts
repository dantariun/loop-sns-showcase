import type { AppNotification, ChatThread, Comment, Message, Post, User } from '@/entities';

/**
 * 데이터 계약.
 *
 * 화면은 이 인터페이스만 알고, 구현이 더미인지 HTTP 인지 모른다.
 * 실제 API 가 생기면 `src/data/index.ts` 의 바인딩만 교체하면 된다 —
 * Kotlin 쪽 Repository + DI 모듈과 같은 역할이다.
 *
 * 전부 Promise 를 돌려준다. 더미라도 비동기 경계를 유지해야
 * 로딩·에러·재시도 경로가 실제와 같은 모양으로 검증된다.
 */

export interface FeedRepository {
  feed(): Promise<Post[]>;
  post(id: string): Promise<Post | null>;
  comments(postId: string): Promise<Comment[]>;
  toggleLike(postId: string): Promise<Post>;
  toggleBookmark(postId: string): Promise<Post>;
  addComment(postId: string, body: string): Promise<Comment>;
  /** 특정 사용자가 작성한 게시물 (프로필 그리드용) */
  postsBy(userId: string): Promise<Post[]>;
  /** 북마크한 게시물 */
  bookmarks(): Promise<Post[]>;
}

export interface UserRepository {
  me(): Promise<User>;
  user(id: string): Promise<User | null>;
  suggestions(): Promise<User[]>;
  toggleFollow(userId: string): Promise<User>;
  followers(userId: string): Promise<User[]>;
  following(userId: string): Promise<User[]>;
}

export interface NotificationRepository {
  notifications(): Promise<AppNotification[]>;
  unreadCount(): Promise<number>;
  markAllRead(): Promise<void>;
}

export interface ChatRepository {
  threads(): Promise<ChatThread[]>;
  messages(threadId: string): Promise<Message[]>;
  send(threadId: string, body: string): Promise<Message>;
}

export interface SearchRepository {
  trendingTags(): Promise<string[]>;
  suggestedUsers(): Promise<User[]>;
  /** 탐색 그리드: 미디어가 있는 게시물 */
  explore(): Promise<Post[]>;
  searchUsers(query: string): Promise<User[]>;
  searchPosts(query: string): Promise<Post[]>;
}

/** 앱이 쓰는 저장소 묶음 — 이 한 덩어리를 통째로 갈아끼운다 */
export interface Repositories {
  feed: FeedRepository;
  users: UserRepository;
  notifications: NotificationRepository;
  chat: ChatRepository;
  search: SearchRepository;
}
