import { create } from 'zustand';

/**
 * "피드를 맨 위로 올려라" 신호.
 *
 * 글을 올리면 새 글이 피드 맨 앞에 붙지만, 리스트는 보던 스크롤 위치를 지킨다.
 * 그러면 등록 직후 화면에는 아무 변화가 없는 것처럼 보인다 — 방금 쓴 글이
 * 화면 위쪽으로 밀려 올라가 있기 때문이다.
 *
 * 글쓰기 화면이 피드 리스트를 직접 알 수는 없으니, 신호만 세워 두고
 * 피드가 포커스를 받을 때 스스로 올라가게 한다.
 */
interface FeedScrollState {
  pending: boolean;
  requestScrollTop: () => void;
  consume: () => void;
}

export const useFeedScroll = create<FeedScrollState>()((set) => ({
  pending: false,
  requestScrollTop: () => set({ pending: true }),
  consume: () => set({ pending: false }),
}));
