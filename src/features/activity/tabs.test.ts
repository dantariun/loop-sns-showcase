import type { AppNotification, NotificationType } from '@/entities';
import { filterByTab, unreadTabs } from './tabs';

function notification(id: string, type: NotificationType, read: boolean): AppNotification {
  return {
    id,
    type,
    actor: {
      id: `u_${id}`,
      handle: id,
      displayName: id,
      bio: '',
      avatarUrl: null,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      isFollowing: false,
      isMe: false,
    },
    postThumbnailUrl: null,
    previewText: '',
    createdAt: 0,
    read,
  };
}

const list: AppNotification[] = [
  notification('a', 'LIKE', false),
  notification('b', 'COMMENT', true),
  notification('c', 'FOLLOW', true),
  notification('d', 'LIKE', true),
];

describe('활동 탭 필터', () => {
  it('ALL 은 원본을 그대로 돌려준다', () => {
    expect(filterByTab(list, 'ALL')).toBe(list);
  });

  it('유형 탭은 그 유형만 남긴다', () => {
    expect(filterByTab(list, 'LIKE').map((n) => n.id)).toEqual(['a', 'd']);
    expect(filterByTab(list, 'MENTION')).toEqual([]);
  });
});

describe('탭별 미읽음', () => {
  it('미읽음이 있는 유형과 ALL 이 함께 켜진다', () => {
    expect([...unreadTabs(list)].sort()).toEqual(['ALL', 'LIKE']);
  });

  it('모두 읽었으면 아무 탭도 켜지지 않는다', () => {
    const read = list.map((n) => ({ ...n, read: true }));
    expect(unreadTabs(read).size).toBe(0);
  });

  it('유형이 여럿이면 각각 켜진다', () => {
    const mixed = [notification('x', 'FOLLOW', false), notification('y', 'MENTION', false)];
    expect([...unreadTabs(mixed)].sort()).toEqual(['ALL', 'FOLLOW', 'MENTION']);
  });
});
