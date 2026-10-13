import type { User } from './user';

export const NOTIFICATION_TYPES = ['LIKE', 'COMMENT', 'FOLLOW', 'MENTION'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** 활동 알림 한 건. 종류에 따라 표시 문구와 우측 프리뷰가 달라진다. */
export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: User;
  /** 관련 게시물 대표 이미지 (좋아요·댓글·멘션일 때) */
  postThumbnailUrl: string | null;
  previewText: string;
  /** epoch millis */
  createdAt: number;
  read: boolean;
}
