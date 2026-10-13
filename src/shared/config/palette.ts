/**
 * 명령형으로 색이 필요한 자리를 위한 팔레트.
 *
 * className 으로 칠하는 곳은 전부 `src/global.css` 의 CSS 변수를 쓴다. 다만
 * 아이콘(lucide)·ActivityIndicator·LinearGradient 처럼 **값**을 요구하는 API 가 있어
 * 같은 색을 TS 쪽에도 둔다.
 *
 * 두 파일이 어긋나면 테마가 조용히 깨지므로 `palette.test.ts` 가 global.css 를 파싱해
 * 값이 일치하는지 검사한다 — 복제를 테스트로 묶어 둔 자리다.
 */

export const palette = {
  light: {
    brand: '#5B5BF5',
    'brand-soft': '#EDEDFE',
    like: '#EC4C4C',
    badge: '#F4C430',
    bg: '#FFFFFF',
    surface: '#F7F7F9',
    border: '#EBEBF0',
    content: '#14141A',
    'content-secondary': '#44444C',
    'content-hint': '#8A8A93',
    'content-disabled': '#C7C7CE',
    bubble: '#F0F0F4',
  },
  dark: {
    brand: '#8080FA',
    'brand-soft': '#262642',
    like: '#F26C6C',
    badge: '#F6D056',
    bg: '#101014',
    surface: '#1B1B21',
    border: '#2C2C34',
    content: '#F0F0F5',
    'content-secondary': '#BABAC4',
    'content-hint': '#82828C',
    'content-disabled': '#54545E',
    bubble: '#282830',
  },
} as const;

export type ColorToken = keyof typeof palette.light;
export type ThemeMode = keyof typeof palette;
