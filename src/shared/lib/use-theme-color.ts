import { useColorScheme } from 'react-native';
import { type ColorToken, palette } from '../config/palette';

/**
 * 토큰 이름으로 현재 테마의 색 값을 얻는다.
 *
 * className 을 쓸 수 없는 API(아이콘, ActivityIndicator, 그라데이션) 전용이다.
 * 뷰를 칠할 때는 `className="bg-surface"` 처럼 토큰 클래스를 쓴다.
 */
export function useThemeColor(token: ColorToken): string {
  const scheme = useColorScheme();
  return palette[scheme === 'dark' ? 'dark' : 'light'][token];
}
