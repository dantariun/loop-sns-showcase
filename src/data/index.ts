import { fakeRepositories } from './fake/fake-repositories';
import type { Repositories } from './repositories';

/**
 * 구현 바인딩 — 앱 전체에서 데이터 출처를 정하는 유일한 지점.
 *
 * 실제 API 가 생기면 이 한 줄을 `httpRepositories` 로 바꾸는 것으로 끝난다.
 * 화면·훅은 인터페이스만 보고 있어 수정할 것이 없다.
 */
export const repositories: Repositories = fakeRepositories;

export type {
  ChatRepository,
  FeedRepository,
  NotificationRepository,
  Repositories,
  SearchRepository,
  UserRepository,
} from './repositories';
