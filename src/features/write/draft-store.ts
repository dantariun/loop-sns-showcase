import { create } from 'zustand';
import { parseHashtags } from './hashtags';

/**
 * 글쓰기 초안 — 세 화면(미디어·미리보기·본문)이 공유하는 상태.
 *
 * 서버가 모르는 작성 중 데이터라 Zustand 가 맡는다. 설정 스토어와 달리
 * **영속하지 않는다** — 앱을 껐다 켰을 때 쓰다 만 글이 되살아나는 건
 * 이 앱이 보여주려는 바가 아니다. 그래서 persist 미들웨어를 쓰지 않는다.
 */
interface DraftState {
  media: string[];
  body: string;
  locationTag: string | null;

  toggleMedia: (id: string) => void;
  setBody: (body: string) => void;
  setLocation: (place: string | null) => void;
  reset: () => void;
}

/** 한 게시물에 넣을 수 있는 미디어 수 */
export const MAX_MEDIA = 5;

const EMPTY = { media: [] as string[], body: '', locationTag: null };

export const useDraft = create<DraftState>()((set) => ({
  ...EMPTY,

  // 선택 순서가 곧 게시물의 미디어 순서다 — 뺐다 넣으면 맨 뒤로 간다
  toggleMedia: (id) =>
    set((s) => {
      if (s.media.includes(id)) return { media: s.media.filter((m) => m !== id) };
      if (s.media.length >= MAX_MEDIA) return s;
      return { media: [...s.media, id] };
    }),

  setBody: (body) => set({ body }),
  setLocation: (locationTag) => set({ locationTag }),
  reset: () => set(EMPTY),
}));

/** 본문에서 파생되는 값 — 저장하지 않고 그때그때 계산한다 */
export function draftHashtags(body: string): string[] {
  return parseHashtags(body);
}
