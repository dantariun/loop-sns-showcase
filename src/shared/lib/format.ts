/** 1234 → "1.2천", 12345 → "1.2만". 프로필 지표·좋아요 수 표기용. */
export function compactCount(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 10_000) return `${trimZero(n / 1_000)}천`;
  if (n < 100_000_000) return `${trimZero(n / 10_000)}만`;
  return `${trimZero(n / 100_000_000)}억`;
}

function trimZero(v: number): string {
  const s = v.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}
