/**
 * 문자열 시드로 결정적 색을 만든다.
 *
 * 더미 데이터는 실제 이미지 URL 이 없다. 아바타·미디어 자리를 시드 기반 색/그라데이션으로
 * 채워 화면마다 다르게 보이게 한다 — 같은 사용자/게시물은 항상 같은 색이라 일관적이다.
 */
const PALETTE = [
  '#6C7BF5',
  '#F5736C',
  '#43C9A0',
  '#F5B342',
  '#B06CF5',
  '#4FA8F5',
  '#F56CAE',
  '#6CD0F5',
  '#A0C94F',
  '#F58C6C',
] as const;

/** Kotlin String.hashCode() 와 같은 알고리즘 — 두 앱의 색이 일치한다 */
function hashCode(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function swatchColor(seed: string): string {
  return PALETTE[hashCode(seed) % PALETTE.length];
}

/** 미디어 플레이스홀더용 사선 그라데이션의 두 색 */
export function swatchGradient(seed: string): [string, string] {
  const h = hashCode(seed);
  return [PALETTE[h % PALETTE.length], PALETTE[(Math.floor(h / 7) + 3) % PALETTE.length]];
}

/** 시드에서 첫 글자(대문자) — 아바타 이니셜 */
export function swatchInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
