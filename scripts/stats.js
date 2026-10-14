/**
 * README 의 산출물 수치를 소스에서 계산해 다시 쓴다.
 *
 * 손으로 적어 두면 세션이 쌓일수록 조용히 어긋난다. 디자인 토큰을 CSS·TS 두 곳에
 * 두면서 일치를 테스트로 묶은 것과 같은 이유로, 수치도 생성하고 낡으면 실패시킨다.
 *
 *   node scripts/stats.js          계산 결과만 출력
 *   node scripts/stats.js --write  README 의 마커 블록을 갱신
 *
 * 커밋 수는 일부러 넣지 않는다 — 수치를 갱신한 커밋 자체가 값을 바꿔 버려
 * 영원히 낡은 상태가 된다. 세션·커밋 기록은 docs/vibe-log.md 가 맡는다.
 */

const { readFileSync, writeFileSync, readdirSync, statSync } = require('node:fs');
const { join, extname } = require('node:path');

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const SCRIPTS = join(ROOT, 'scripts');
const README = join(ROOT, 'README.md');

/** 레이어 표기 순서 — 라인 수가 아니라 의존 방향 순으로 읽히게 한다 */
const LAYERS = ['app', 'features', 'entities', 'data', 'shared'];

const SOURCE_EXT = new Set(['.ts', '.tsx', '.css']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

const isSource = (path) => SOURCE_EXT.has(extname(path));

/** `npm test` 가 집어가는 범위와 같게 — src 밖(scripts)의 테스트도 센다 */
const isTest = (path) => /\.test\.[jt]sx?$/.test(path);

/** `wc -l` 과 같은 기준 — 줄바꿈 개수 */
function countLines(path) {
  const text = readFileSync(path, 'utf8');
  let n = 0;
  for (const ch of text) if (ch === '\n') n += 1;
  return n;
}

/** `it(` / `test(` 로 시작하는 줄을 테스트 한 건으로 센다 */
function countTestCases(path) {
  const text = readFileSync(path, 'utf8');
  return (text.match(/^\s*(?:it|test)\(/gm) ?? []).length;
}

function computeStats() {
  // 소스 규모는 src 기준. 테스트는 npm test 가 집어가는 범위(src + scripts) 전체.
  const files = walk(SRC).filter(isSource);
  const tests = [...walk(SRC), ...walk(SCRIPTS)].filter(isTest);

  const totalLines = files.reduce((sum, f) => sum + countLines(f), 0);
  const testLines = tests.reduce((sum, f) => sum + countLines(f), 0);
  const testCases = tests.reduce((sum, f) => sum + countTestCases(f), 0);

  const layers = LAYERS.map((name) => {
    const dir = join(SRC, name);
    const lines = files
      .filter((f) => f.startsWith(`${dir}/`))
      .reduce((sum, f) => sum + countLines(f), 0);
    return { name, lines };
  }).filter((l) => l.lines > 0);

  return {
    files: files.length,
    lines: totalLines,
    testFiles: tests.length,
    testLines,
    testCases,
    layers,
  };
}

const n = (value) => value.toLocaleString('en-US');

/** 소개글용 한 줄 — 마침표까지 포함해 문장을 닫는다 */
function renderStatsLine(s) {
  return `현재 소스 ${s.files}개 파일 ${n(s.lines)}줄, 테스트 ${s.testCases}개.`;
}

/** 산출물 절의 표 */
function renderStatsBlock(s) {
  const layers = s.layers.map((l) => `${l.name} ${n(l.lines)}줄`).join(' · ');
  return [
    '| | |',
    '|---|---|',
    `| 소스 | **${s.files}개 파일 · ${n(s.lines)}줄** |`,
    `| 레이어별 | ${layers} |`,
    `| 테스트 | **${s.testCases}개** (${s.testFiles}개 파일 · ${n(s.testLines)}줄) |`,
  ].join('\n');
}

/**
 * `<!-- name:start -->` ~ `<!-- name:end -->` 사이를 갈아끼운다.
 *
 * 시작 마커 앞에 붙은 것(인용문의 `> `, 들여쓰기)을 본문 각 줄에도 그대로 붙인다.
 * 이게 없으면 인용 블록 안의 마커를 갱신할 때 블록이 끊긴다.
 */
function replaceBlock(markdown, name, body) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;

  const startIndex = markdown.indexOf(start);
  const endIndex = markdown.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`README 에 '${name}' 마커가 없습니다`);
  }

  const prefix = markdown.slice(markdown.lastIndexOf('\n', startIndex) + 1, startIndex);
  const indented = body
    .split('\n')
    .map((line) => (line ? prefix + line : prefix.trimEnd()))
    .join('\n');

  return `${markdown.slice(0, startIndex + start.length)}\n${indented}\n${prefix}${markdown.slice(endIndex)}`;
}

function renderReadme(markdown, stats) {
  let next = replaceBlock(markdown, 'stats-line', renderStatsLine(stats));
  next = replaceBlock(next, 'stats', renderStatsBlock(stats));
  return next;
}

module.exports = { computeStats, renderReadme, renderStatsBlock, renderStatsLine, README };

if (require.main === module) {
  const stats = computeStats();
  const current = readFileSync(README, 'utf8');
  const next = renderReadme(current, stats);

  if (process.argv.includes('--write')) {
    if (next === current) {
      console.log('README 수치가 이미 최신입니다.');
    } else {
      writeFileSync(README, next);
      console.log('README 수치를 갱신했습니다.');
    }
  }

  console.log(renderStatsLine(stats));
  for (const layer of stats.layers) {
    console.log(`  ${layer.name.padEnd(9)} ${n(layer.lines)}줄`);
  }
}
