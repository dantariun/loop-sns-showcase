import type { User } from './user';

/** DM 대화방 목록 항목 */
export interface ChatThread {
  id: string;
  peer: User;
  lastMessage: string;
  /** epoch millis */
  lastMessageAt: number;
  unreadCount: number;
}

/** 대화방 안의 메시지 한 건 */
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  /** epoch millis */
  sentAt: number;
  mine: boolean;
}
