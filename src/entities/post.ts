import type { User } from './user';

/** 피드 게시물. 미디어는 URL 목록, 첫 장이 대표. */
export interface Post {
  id: string;
  author: User;
  body: string;
  mediaUrls: string[];
  hashtags: string[];
  locationTag: string | null;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  bookmarked: boolean;
  /** epoch millis */
  createdAt: number;
}
