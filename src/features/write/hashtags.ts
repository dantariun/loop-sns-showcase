/**
 * 본문 안의 해시태그 처리 — 순수 함수만 모아 화면과 스토어가 같이 쓴다.
 *
 * 해시태그는 `#` 뒤에 글자·숫자·밑줄이 이어지는 토큰이다.
 * `#` 앞은 문자열 시작이거나 공백이어야 한다 — `abc#def` 는 태그가 아니다.
 */

/** 유니코드 글자/숫자를 포함한다 — 한글 태그가 잡혀야 한다 */
const TOKEN = /(^|\s)#([\p{L}\p{N}_]+)/gu;

/** 본문에서 해시태그를 뽑는다. `#` 은 떼고, 중복은 첫 등장만 남긴다. */
export function parseHashtags(body: string): string[] {
  const found: string[] = [];
  for (const match of body.matchAll(TOKEN)) {
    const tag = match[2];
    if (!found.includes(tag)) found.push(tag);
  }
  return found;
}

/**
 * 커서가 올라가 있는 "입력 중인" 해시태그.
 *
 * 추천 목록을 언제 열고 닫을지 정하는 근거다 — `#노을 |` 처럼
 * 공백 뒤로 나가면 null 이 되어 목록이 닫힌다.
 */
export function activeHashtag(body: string, cursor: number): string | null {
  if (cursor <= 0 || cursor > body.length) return null;

  let start = cursor - 1;
  while (start >= 0) {
    const ch = body[start];
    if (ch === '#') break;
    if (!/[\p{L}\p{N}_]/u.test(ch)) return null;
    start -= 1;
  }
  if (start < 0) return null;

  const before = start === 0 ? '' : body[start - 1];
  if (before !== '' && !/\s/.test(before)) return null;

  return body.slice(start + 1, cursor);
}

/** 입력 중인 태그를 고른 태그로 바꾼 본문과 새 커서 위치 */
export function applyHashtag(
  body: string,
  cursor: number,
  tag: string,
): { body: string; cursor: number } {
  const active = activeHashtag(body, cursor);
  if (active === null) return { body, cursor };

  const start = cursor - active.length - 1; // '#' 포함
  const next = `${body.slice(0, start)}#${tag} ${body.slice(cursor)}`;
  return { body: next, cursor: start + tag.length + 2 };
}
