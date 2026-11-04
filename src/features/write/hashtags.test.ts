import { activeHashtag, applyHashtag, parseHashtags } from './hashtags';

describe('parseHashtags', () => {
  it('한글·영문·숫자 태그를 뽑는다', () => {
    expect(parseHashtags('노을 좋다 #서울 #sunset #2026')).toEqual(['서울', 'sunset', '2026']);
  });

  it('# 앞이 공백이 아니면 태그가 아니다', () => {
    expect(parseHashtags('abc#def')).toEqual([]);
    expect(parseHashtags('색#조합 #진짜')).toEqual(['진짜']);
  });

  it('중복은 첫 등장만 남긴다', () => {
    expect(parseHashtags('#서울 밤 #서울')).toEqual(['서울']);
  });

  it('# 만 있으면 태그가 아니다', () => {
    expect(parseHashtags('# 그냥 샵')).toEqual([]);
  });
});

describe('activeHashtag', () => {
  const body = '오늘 #노을';

  it('태그 끝에 커서가 있으면 입력 중으로 본다', () => {
    expect(activeHashtag(body, body.length)).toBe('노을');
  });

  it('# 바로 뒤도 입력 중이다 — 추천을 바로 열어야 한다', () => {
    expect(activeHashtag('오늘 #', 4)).toBe('');
  });

  it('공백 뒤로 나가면 닫는다', () => {
    expect(activeHashtag('오늘 #노을 ', 8)).toBeNull();
  });

  it('태그 밖 일반 텍스트에서는 null', () => {
    expect(activeHashtag('오늘 날씨', 5)).toBeNull();
  });
});

describe('applyHashtag', () => {
  it('입력 중인 토큰을 고른 태그로 바꾸고 커서를 뒤로 보낸다', () => {
    const result = applyHashtag('오늘 #노', 5, '노을');
    expect(result.body).toBe('오늘 #노을 ');
    expect(result.cursor).toBe(result.body.length);
  });

  it('입력 중인 태그가 없으면 그대로 둔다', () => {
    const result = applyHashtag('오늘 날씨', 5, '노을');
    expect(result).toEqual({ body: '오늘 날씨', cursor: 5 });
  });
});
