import { Redirect } from 'expo-router';

/**
 * 탭 자리를 차지하기 위한 빈 라우트.
 *
 * 가운데 글쓰기 탭은 눌리면 모달을 띄우고 탭 전환 자체를 막는다(_layout 의 tabPress).
 * 그래도 딥링크 등으로 직접 들어오면 이 화면이 모달로 넘긴다.
 */
export default function WriteTabPlaceholder() {
  return <Redirect href="/write" />;
}
