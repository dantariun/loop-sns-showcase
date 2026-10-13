import type { User } from './user';

export interface Comment {
  id: string;
  postId: string;
  author: User;
  body: string;
  likeCount: number;
  liked: boolean;
  /** epoch millis */
  createdAt: number;
}
