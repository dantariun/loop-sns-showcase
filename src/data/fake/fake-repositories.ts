import type { AppNotification, Comment, Message, Post, User } from '@/entities';
import type {
  ChatRepository,
  FeedRepository,
  NotificationRepository,
  Repositories,
  SearchRepository,
  UserRepository,
} from '../repositories';
import { db, delay, replaceById, syncUserEverywhere } from './db';
import { trendingTags } from './dummy-data';

/** 최신순 정렬 — 피드·탐색이 공유한다 */
const byNewest = (a: Post, b: Post) => b.createdAt - a.createdAt;

function requirePost(id: string): Post {
  const post = db.posts.find((p) => p.id === id);
  if (!post) throw new Error(`게시물 없음: ${id}`);
  return post;
}

const feed: FeedRepository = {
  async feed() {
    return delay([...db.posts].sort(byNewest));
  },

  async post(id) {
    return delay(db.posts.find((p) => p.id === id) ?? null);
  },

  async comments(postId) {
    return delay(db.comments.get(postId) ?? []);
  },

  async toggleLike(postId) {
    const post = requirePost(postId);
    const next: Post = {
      ...post,
      liked: !post.liked,
      likeCount: post.likeCount + (post.liked ? -1 : 1),
    };
    db.posts = replaceById(db.posts, next);
    return delay(next);
  },

  async toggleBookmark(postId) {
    const post = requirePost(postId);
    const next: Post = { ...post, bookmarked: !post.bookmarked };
    db.posts = replaceById(db.posts, next);
    return delay(next);
  },

  async addComment(postId, body) {
    const comment: Comment = {
      id: `${postId}_c_${Date.now()}`,
      postId,
      author: db.me,
      body,
      likeCount: 0,
      liked: false,
      createdAt: Date.now(),
    };
    db.comments.set(postId, [...(db.comments.get(postId) ?? []), comment]);

    const post = requirePost(postId);
    db.posts = replaceById(db.posts, { ...post, commentCount: post.commentCount + 1 });

    return delay(comment);
  },

  async postsBy(userId) {
    return delay(db.posts.filter((p) => p.author.id === userId).sort(byNewest));
  },

  async bookmarks() {
    return delay(db.posts.filter((p) => p.bookmarked).sort(byNewest));
  },

  async createPost(draft) {
    const post: Post = {
      id: `me_${Date.now()}`,
      author: db.me,
      body: draft.body,
      mediaUrls: draft.mediaIds,
      hashtags: draft.hashtags,
      locationTag: draft.locationTag,
      likeCount: 0,
      commentCount: 0,
      liked: false,
      bookmarked: false,
      createdAt: Date.now(),
    };
    db.posts = [post, ...db.posts];
    db.comments.set(post.id, []);
    db.me = { ...db.me, postCount: db.me.postCount + 1 };
    return delay(post);
  },
};

const users: UserRepository = {
  async me() {
    return delay(db.me);
  },

  async user(id) {
    if (id === db.me.id) return delay(db.me);
    return delay(db.users.find((u) => u.id === id) ?? null);
  },

  async suggestions() {
    return delay(db.users.filter((u) => !u.isFollowing).slice(0, 5));
  },

  async toggleFollow(userId) {
    const target = db.users.find((u) => u.id === userId);
    if (!target) throw new Error(`사용자 없음: ${userId}`);

    const next: User = {
      ...target,
      isFollowing: !target.isFollowing,
      followerCount: target.followerCount + (target.isFollowing ? -1 : 1),
    };
    syncUserEverywhere(next);

    // 내 팔로잉 수도 따라 움직인다
    db.me = {
      ...db.me,
      followingCount: db.me.followingCount + (target.isFollowing ? -1 : 1),
    };

    return delay(next);
  },

  async followers(userId) {
    // 더미: 본인을 제외한 사용자 중 앞쪽 일부
    return delay(db.users.filter((u) => u.id !== userId).slice(0, 6));
  },

  async following(userId) {
    return delay(db.users.filter((u) => u.id !== userId && u.isFollowing));
  },

  async updateMe(patch) {
    const handle = patch.handle.trim();
    const taken = db.users.some((u) => u.id !== db.me.id && u.handle === handle);
    if (taken) throw new Error('이미 사용 중인 아이디입니다');

    const next: User = {
      ...db.me,
      handle,
      displayName: patch.displayName.trim(),
      bio: patch.bio.trim(),
    };
    // 내 이름은 게시물·댓글·대화방에도 박혀 있다 — 한 번에 갈아끼운다
    syncUserEverywhere(next);

    return delay(next);
  },
};

const notifications: NotificationRepository = {
  async notifications() {
    return delay([...db.notifications].sort((a, b) => b.createdAt - a.createdAt));
  },

  async unreadCount() {
    return delay(db.notifications.filter((n) => !n.read).length);
  },

  async markAllRead() {
    db.notifications = db.notifications.map((n) => (n.read ? n : { ...n, read: true }));
    return delay(undefined);
  },

  async markRead(id) {
    const target = db.notifications.find((n) => n.id === id);
    if (!target) throw new Error(`알림 없음: ${id}`);

    const next: AppNotification = { ...target, read: true };
    db.notifications = replaceById(db.notifications, next);
    return delay(next);
  },

  async remove(id) {
    db.notifications = db.notifications.filter((n) => n.id !== id);
    return delay(undefined);
  },
};

const chat: ChatRepository = {
  async threads() {
    return delay([...db.threads].sort((a, b) => b.lastMessageAt - a.lastMessageAt));
  },

  async messages(threadId) {
    // 방에 들어가면 읽음 처리
    const thread = db.threads.find((t) => t.id === threadId);
    if (thread && thread.unreadCount > 0) {
      db.threads = replaceById(db.threads, { ...thread, unreadCount: 0 });
    }
    return delay(db.messages.get(threadId) ?? []);
  },

  async send(threadId, body) {
    const message: Message = {
      id: `${threadId}_m_${Date.now()}`,
      threadId,
      senderId: db.me.id,
      body,
      sentAt: Date.now(),
      mine: true,
    };
    db.messages.set(threadId, [...(db.messages.get(threadId) ?? []), message]);

    const thread = db.threads.find((t) => t.id === threadId);
    if (thread) {
      db.threads = replaceById(db.threads, {
        ...thread,
        lastMessage: body,
        lastMessageAt: message.sentAt,
      });
    }
    return delay(message);
  },
};

const search: SearchRepository = {
  async trendingTags() {
    return delay(trendingTags);
  },

  async suggestedUsers() {
    return delay(db.users.filter((u) => !u.isFollowing).slice(0, 6));
  },

  async explore() {
    return delay(db.posts.filter((p) => p.mediaUrls.length > 0).sort(byNewest));
  },

  async searchUsers(query) {
    const q = query.trim().toLowerCase();
    if (!q) return delay([]);
    return delay(
      db.users.filter(
        (u) => u.handle.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q),
      ),
    );
  },

  async searchPosts(query) {
    const q = query.trim().toLowerCase();
    if (!q) return delay([]);
    return delay(
      db.posts.filter(
        (p) =>
          p.body.toLowerCase().includes(q) || p.hashtags.some((t) => t.toLowerCase().includes(q)),
      ),
    );
  },
};

/** 더미 구현 묶음 */
export const fakeRepositories: Repositories = {
  feed,
  users,
  notifications,
  chat,
  search,
};
