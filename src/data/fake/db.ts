import type { AppNotification, ChatThread, Comment, Message, Post, User } from '@/entities';
import * as seed from './dummy-data';

/**
 * 인메모리 "서버".
 *
 * 저장소 구현이 읽고 쓰는 유일한 상태다. 화면이 여기에 직접 접근하지 않는 것이 핵심 —
 * 그래야 나중에 이 파일을 통째로 들어내고 HTTP 구현을 넣어도 화면이 그대로 돈다.
 *
 * React 상태가 아니라 평범한 모듈 변수다. 서버를 흉내 내는 자리이므로
 * 렌더링과 무관해야 하고, 변경 전파는 TanStack Query 캐시가 맡는다.
 */

interface Db {
  me: User;
  users: User[];
  posts: Post[];
  comments: Map<string, Comment[]>;
  notifications: AppNotification[];
  threads: ChatThread[];
  messages: Map<string, Message[]>;
}

function initialDb(): Db {
  return {
    me: { ...seed.me },
    users: seed.users.map((u) => ({ ...u })),
    posts: seed.posts.map((p) => ({ ...p })),
    comments: new Map(seed.posts.map((p) => [p.id, seed.commentsFor(p.id)])),
    notifications: seed.notifications.map((n) => ({ ...n })),
    threads: seed.threads.map((t) => ({ ...t })),
    messages: new Map(seed.threads.map((t) => [t.id, seed.messagesFor(t.id)])),
  };
}

export const db: Db = initialDb();

/** 테스트에서 각 케이스를 깨끗한 상태로 시작시킨다 */
export function resetDb(): void {
  Object.assign(db, initialDb());
}

/**
 * 네트워크 왕복 흉내.
 *
 * 0 이 아니어야 스켈레톤·당겨서 새로고침·낙관적 업데이트가 실제로 보이는 경로를 탄다.
 * 테스트에서는 0 으로 떨어뜨려 기다리지 않는다.
 */
export const LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 220;

export function delay<T>(value: T, ms: number = LATENCY_MS): Promise<T> {
  if (ms <= 0) return Promise.resolve(value);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** 목록 안의 한 항목만 교체한 새 배열 — 불변 갱신 */
export function replaceById<T extends { id: string }>(list: T[], next: T): T[] {
  return list.map((item) => (item.id === next.id ? next : item));
}

/** 사용자 정보가 바뀌면 그 사용자가 박혀 있는 게시물·댓글·대화방도 같이 갱신한다 */
export function syncUserEverywhere(next: User): void {
  if (next.isMe) db.me = next;
  db.users = replaceById(db.users, next);
  db.posts = db.posts.map((p) => (p.author.id === next.id ? { ...p, author: next } : p));
  db.threads = db.threads.map((t) => (t.peer.id === next.id ? { ...t, peer: next } : t));
  for (const [postId, list] of db.comments) {
    db.comments.set(
      postId,
      list.map((c) => (c.author.id === next.id ? { ...c, author: next } : c)),
    );
  }
}
