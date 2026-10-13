/** epoch millis → "방금 · 5분 · 3시간 · 2일 · 3주" 같은 상대 시각 */
export function relativeTime(epochMillis: number, now: number = Date.now()): string {
  const diff = Math.max(now - epochMillis, 0);
  const min = Math.floor(diff / 60_000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (min < 1) return '방금';
  if (min < 60) return `${min}분`;
  if (hour < 24) return `${hour}시간`;
  if (day < 7) return `${day}일`;
  return `${Math.floor(day / 7)}주`;
}

/** 대화방 말풍선 옆 시각 — "오후 3:24" */
export function clockTime(epochMillis: number): string {
  return new Date(epochMillis).toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
