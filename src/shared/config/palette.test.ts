import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { palette } from './palette';

/**
 * palette.ts 와 global.css 는 같은 색을 두 형식으로 들고 있다.
 * 한쪽만 고치면 클래스로 칠한 색과 아이콘 색이 어긋나므로 여기서 묶어 둔다.
 */

const css = readFileSync(join(__dirname, '../../global.css'), 'utf8');

/** `--color-brand: 91 91 245;` → `#5B5BF5` */
function parseBlock(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /--color-([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g;
  let m = re.exec(source);
  while (m !== null) {
    const [, name, r, g, b] = m;
    out[name] =
      `#${[r, g, b].map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
    m = re.exec(source);
  }
  return out;
}

/** 다크 블록은 prefers-color-scheme 미디어 쿼리 안에 있다 */
const darkStart = css.indexOf('prefers-color-scheme: dark');
const lightCss = css.slice(0, darkStart);
const darkCss = css.slice(darkStart);

describe('디자인 토큰', () => {
  it('라이트 테마가 global.css 와 일치한다', () => {
    const fromCss = parseBlock(lightCss);
    for (const [token, hex] of Object.entries(palette.light)) {
      expect(fromCss[cssName(token)]).toBe(hex.toUpperCase());
    }
  });

  it('다크 테마가 global.css 와 일치한다', () => {
    const fromCss = parseBlock(darkCss);
    for (const [token, hex] of Object.entries(palette.dark)) {
      expect(fromCss[cssName(token)]).toBe(hex.toUpperCase());
    }
  });

  it('라이트와 다크가 같은 토큰 집합을 갖는다', () => {
    expect(Object.keys(palette.light).sort()).toEqual(Object.keys(palette.dark).sort());
  });
});

/** palette 의 `content-hint` ↔ css 의 `text-hint` 등 이름 차이를 흡수한다 */
function cssName(token: string): string {
  if (token === 'content') return 'text';
  if (token.startsWith('content-')) return token.replace('content-', 'text-');
  if (token === 'bubble') return 'bubble-peer';
  return token;
}
