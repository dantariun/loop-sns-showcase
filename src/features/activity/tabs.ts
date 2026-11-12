import type { AppNotification, NotificationType } from '@/entities';

export const ACTIVITY_TABS = ['ALL', 'LIKE', 'COMMENT', 'FOLLOW', 'MENTION'] as const;

export type ActivityTab = (typeof ACTIVITY_TABS)[number];

export const TAB_LABEL: Record<ActivityTab, string> = {
  ALL: '전체',
  LIKE: '좋아요',
  COMMENT: '댓글',
  FOLLOW: '팔로우',
  MENTION: '멘션',
};

/** 그 탭이 품는 알림인가. ALL 은 전부 받는다. */
export function belongsTo(tab: ActivityTab, type: NotificationType): boolean {
  return tab === 'ALL' || tab === type;
}

export function filterByTab(list: AppNotification[], tab: ActivityTab): AppNotification[] {
  return tab === 'ALL' ? list : list.filter((n) => belongsTo(tab, n.type));
}

/**
 * 미읽음이 있는 탭 집합.
 *
 * 서버에 따로 묻지 않고 목록에서 파생시킨다 — 두 값이 어긋날 여지를 없앤다.
 * ALL 은 하나라도 안 읽었으면 켜진다.
 */
export function unreadTabs(list: AppNotification[]): Set<ActivityTab> {
  const tabs = new Set<ActivityTab>();

  for (const n of list) {
    if (n.read) continue;
    tabs.add('ALL');
    tabs.add(n.type);
  }

  return tabs;
}
