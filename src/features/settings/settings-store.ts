import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * 순수 클라이언트 상태 — 서버가 모르는 사용자의 기기별 선택.
 *
 * 서버 상태(게시물·사용자·알림)는 TanStack Query 가 맡고, Zustand 는 이쪽만 본다.
 * 두 가지를 섞지 않는 것이 이 앱의 상태 관리 규칙이다.
 */
interface SettingsState {
  pushEnabled: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  followNotifications: boolean;
  reduceMotion: boolean;
  toggle: (key: SettingsToggleKey) => void;
}

export type SettingsToggleKey =
  | 'pushEnabled'
  | 'likeNotifications'
  | 'commentNotifications'
  | 'followNotifications'
  | 'reduceMotion';

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      pushEnabled: true,
      likeNotifications: true,
      commentNotifications: true,
      followNotifications: false,
      reduceMotion: false,
      toggle: (key) => set((state) => ({ [key]: !state[key] }) as Pick<SettingsState, typeof key>),
    }),
    {
      name: 'loop-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // 함수는 저장하지 않는다
      partialize: ({ toggle, ...rest }) => rest,
    },
  ),
);
