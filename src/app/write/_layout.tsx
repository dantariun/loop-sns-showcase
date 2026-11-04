import { Stack } from 'expo-router';

/**
 * 글쓰기 그래프.
 *
 * 탭 위에 모달로 올라온다 — 작성 중에는 다른 탭으로 새지 않게 하고,
 * 닫으면 초안을 버린 뒤 원래 보던 화면으로 돌아간다.
 */
export default function WriteLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
