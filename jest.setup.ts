// RNTL 14 부터 jest 매처가 기본 포함이라 별도 extend 가 필요 없다
import { resetDb } from '@/data/fake/db';

// 각 테스트가 같은 시드에서 출발하도록 더미 서버를 되돌린다
beforeEach(() => {
  resetDb();
});
