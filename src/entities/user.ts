/** 서비스 사용자. avatarUrl 은 더미 단계에서 아바타 색을 정하는 시드로도 쓰인다. */
export interface User {
  id: string;
  /** @username */
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
  isMe: boolean;
}
