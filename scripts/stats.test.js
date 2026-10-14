const { readFileSync } = require('node:fs');
const { computeStats, renderReadme, README } = require('./stats');

/**
 * README 의 수치는 생성물이다. 소스를 고치고 `npm run stats` 를 잊으면
 * 문서가 조용히 거짓이 되므로 여기서 막는다.
 */
describe('README 산출물 수치', () => {
  it('현재 소스와 일치한다', () => {
    const current = readFileSync(README, 'utf8');
    const expected = renderReadme(current, computeStats());

    if (current !== expected) {
      throw new Error('README 수치가 낡았습니다. `npm run stats` 를 실행하세요.');
    }
  });
});
