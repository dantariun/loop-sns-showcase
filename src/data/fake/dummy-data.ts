import type { AppNotification, ChatThread, Comment, Message, Post, User } from '@/entities';

/**
 * 앱 전체가 쓰는 더미 데이터의 단일 출처.
 *
 * API 가 없으므로 모든 화면이 이 시드에서 나온다. id 는 안정적이라 좋아요·팔로우 토글
 * 상태가 화면 간에 일관되게 유지된다. 시각은 앱 로드 시점 기준 상대값이라 늘 자연스럽다.
 */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const now = Date.now();
const ago = (millis: number): number => now - millis;

/** User 기본값 — 더미 선언에서 반복을 걷어낸다 */
function mkUser(partial: Partial<User> & Pick<User, 'id' | 'handle' | 'displayName'>): User {
  return {
    bio: '',
    avatarUrl: null,
    followerCount: 0,
    followingCount: 0,
    postCount: 0,
    isFollowing: false,
    isMe: false,
    ...partial,
  };
}

export const me: User = mkUser({
  id: 'u_me',
  handle: 'yourname',
  displayName: '김루프',
  bio: '매일의 순간을 기록합니다 📷\n서울 · 사진 · 커피',
  followerCount: 1240,
  followingCount: 312,
  postCount: 48,
  isMe: true,
});

export const users: User[] = [
  mkUser({
    id: 'u1',
    handle: 'mint_daily',
    displayName: '민트데일리',
    bio: '일상 · 카페투어 ☕️',
    followerCount: 8300,
    followingCount: 210,
    postCount: 132,
    isFollowing: true,
  }),
  mkUser({
    id: 'u2',
    handle: 'seoul_walker',
    displayName: '서울워커',
    bio: '걷다가 찍은 서울',
    followerCount: 15400,
    followingCount: 88,
    postCount: 300,
  }),
  mkUser({
    id: 'u3',
    handle: 'film_grain',
    displayName: '필름그레인',
    bio: '필름 카메라 기록',
    followerCount: 5200,
    followingCount: 340,
    postCount: 76,
    isFollowing: true,
  }),
  mkUser({
    id: 'u4',
    handle: 'plant_mom',
    displayName: '식집사',
    bio: '우리집 초록이들 🌿',
    followerCount: 2100,
    followingCount: 190,
    postCount: 54,
  }),
  mkUser({
    id: 'u5',
    handle: 'run_every',
    displayName: '러닝하는사람',
    bio: '아침 러닝 · 마라톤',
    followerCount: 9800,
    followingCount: 120,
    postCount: 210,
    isFollowing: true,
  }),
  mkUser({
    id: 'u6',
    handle: 'book_nook',
    displayName: '책읽는밤',
    bio: '한 달 12권',
    followerCount: 3400,
    followingCount: 500,
    postCount: 95,
  }),
  mkUser({
    id: 'u7',
    handle: 'code_life',
    displayName: '개발자의삶',
    bio: '리액트 네이티브 · Expo',
    followerCount: 6700,
    followingCount: 230,
    postCount: 61,
  }),
  mkUser({
    id: 'u8',
    handle: 'trip_log',
    displayName: '여행로그',
    bio: '37개국 기록 중 ✈️',
    followerCount: 24000,
    followingCount: 60,
    postCount: 480,
  }),
];

const user = (id: string): User => {
  const found = users.find((u) => u.id === id);
  if (!found) throw new Error(`더미 사용자 없음: ${id}`);
  return found;
};

/** Post 기본값 */
function mkPost(partial: Partial<Post> & Pick<Post, 'id' | 'author' | 'body' | 'createdAt'>): Post {
  return {
    mediaUrls: [],
    hashtags: [],
    locationTag: null,
    likeCount: 0,
    commentCount: 0,
    liked: false,
    bookmarked: false,
    ...partial,
  };
}

export const posts: Post[] = [
  mkPost({
    id: 'p1',
    author: user('u2'),
    body: '퇴근길 골목에서 만난 노을. 이 시간의 서울은 늘 좋다.',
    mediaUrls: ['m_p1_1', 'm_p1_2'],
    hashtags: ['서울', '노을', '일상'],
    locationTag: '성수동',
    likeCount: 342,
    commentCount: 18,
    createdAt: ago(2 * HOUR),
  }),
  mkPost({
    id: 'p2',
    author: user('u1'),
    body: '새로 문 연 카페. 라떼 밸런스가 좋았어요.',
    mediaUrls: ['m_p2_1'],
    hashtags: ['카페투어', '라떼'],
    locationTag: '연남동',
    likeCount: 128,
    commentCount: 9,
    liked: true,
    createdAt: ago(5 * HOUR),
  }),
  mkPost({
    id: 'p3',
    author: user('u5'),
    body: '오늘 아침 10km. 날이 선선해져서 페이스가 잘 나온다 🏃',
    hashtags: ['러닝', '모닝루틴'],
    likeCount: 512,
    commentCount: 41,
    bookmarked: true,
    createdAt: ago(8 * HOUR),
  }),
  mkPost({
    id: 'p4',
    author: user('u3'),
    body: '필름 두 롤 현상 맡기고 왔다. 기다리는 시간이 제일 설렘.',
    mediaUrls: ['m_p4_1', 'm_p4_2', 'm_p4_3'],
    hashtags: ['필름카메라', '포트라'],
    likeCount: 267,
    commentCount: 22,
    liked: true,
    createdAt: ago(DAY),
  }),
  mkPost({
    id: 'p5',
    author: user('u4'),
    body: '몬스테라 새 잎이 드디어 펼쳐졌다 🌿 3주 걸림.',
    mediaUrls: ['m_p5_1'],
    hashtags: ['식물', '몬스테라'],
    likeCount: 96,
    commentCount: 7,
    createdAt: ago(DAY + 3 * HOUR),
  }),
  mkPost({
    id: 'p6',
    author: user('u8'),
    body: '치앙마이에서의 마지막 밤. 야시장 국수 한 그릇.',
    mediaUrls: ['m_p6_1', 'm_p6_2'],
    hashtags: ['여행', '치앙마이', '태국'],
    locationTag: 'Chiang Mai',
    likeCount: 1203,
    commentCount: 88,
    createdAt: ago(2 * DAY),
  }),
  mkPost({
    id: 'p7',
    author: user('u7'),
    body: 'Expo Router 로 탭 구조 다시 짜다가 하루 다 갔네. 그래도 깔끔해서 만족.',
    hashtags: ['리액트네이티브', 'Expo', '개발일지'],
    likeCount: 178,
    commentCount: 33,
    createdAt: ago(3 * DAY),
  }),
  mkPost({
    id: 'p8',
    author: user('u6'),
    body: '이번 달 완독. 문장 하나하나 밑줄 긋고 싶은 책이었다.',
    mediaUrls: ['m_p8_1'],
    hashtags: ['독서', '책추천'],
    likeCount: 84,
    commentCount: 12,
    createdAt: ago(4 * DAY),
  }),

  // 내 게시물 — 프로필 그리드를 채운다
  mkPost({
    id: 'me1',
    author: me,
    body: '주말 아침 홈카페. 직접 내린 핸드드립 한 잔.',
    mediaUrls: ['m_me1_1'],
    hashtags: ['홈카페', '핸드드립'],
    likeCount: 63,
    commentCount: 5,
    createdAt: ago(6 * HOUR),
  }),
  mkPost({
    id: 'me2',
    author: me,
    body: '성수동 골목 산책. 오래된 간판들이 좋다.',
    mediaUrls: ['m_me2_1', 'm_me2_2'],
    hashtags: ['성수동', '산책'],
    locationTag: '성수동',
    likeCount: 128,
    commentCount: 11,
    createdAt: ago(DAY + 2 * HOUR),
  }),
  mkPost({
    id: 'me3',
    author: me,
    body: '새로 산 필름 카메라 첫 롤. 결과가 기대된다.',
    mediaUrls: ['m_me3_1'],
    hashtags: ['필름카메라'],
    likeCount: 94,
    commentCount: 8,
    createdAt: ago(2 * DAY),
  }),
  mkPost({
    id: 'me4',
    author: me,
    body: '책상 정리 완료. 미니멀하게.',
    mediaUrls: ['m_me4_1'],
    hashtags: ['데스크셋업'],
    likeCount: 210,
    commentCount: 19,
    createdAt: ago(3 * DAY),
  }),
  mkPost({
    id: 'me5',
    author: me,
    body: '한강 야경. 오늘도 수고했어요.',
    mediaUrls: ['m_me5_1', 'm_me5_2'],
    hashtags: ['한강', '야경'],
    likeCount: 302,
    commentCount: 24,
    createdAt: ago(5 * DAY),
  }),
  mkPost({
    id: 'me6',
    author: me,
    body: '오랜만의 러닝. 페이스는 느렸지만 기분은 최고.',
    mediaUrls: ['m_me6_1'],
    hashtags: ['러닝', '주말'],
    likeCount: 77,
    commentCount: 6,
    createdAt: ago(6 * DAY),
  }),
];

export function commentsFor(postId: string): Comment[] {
  return [
    {
      id: `${postId}_c1`,
      postId,
      author: user('u1'),
      body: '우와 색감 미쳤다 😍',
      likeCount: 4,
      liked: false,
      createdAt: ago(30 * MIN),
    },
    {
      id: `${postId}_c2`,
      postId,
      author: user('u5'),
      body: '여기 어디예요? 저장해둘래요',
      likeCount: 1,
      liked: false,
      createdAt: ago(HOUR),
    },
    {
      id: `${postId}_c3`,
      postId,
      author: user('u3'),
      body: '역시 이 시간대가 최고죠',
      likeCount: 2,
      liked: true,
      createdAt: ago(2 * HOUR),
    },
  ];
}

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'LIKE',
    actor: user('u1'),
    postThumbnailUrl: 'm_p2_1',
    previewText: '회원님의 게시물을 좋아합니다',
    createdAt: ago(12 * MIN),
    read: false,
  },
  {
    id: 'n2',
    type: 'FOLLOW',
    actor: user('u7'),
    postThumbnailUrl: null,
    previewText: '회원님을 팔로우하기 시작했습니다',
    createdAt: ago(HOUR),
    read: false,
  },
  {
    id: 'n3',
    type: 'COMMENT',
    actor: user('u5'),
    postThumbnailUrl: 'm_p3_1',
    previewText: '댓글: 페이스 정말 좋으시네요!',
    createdAt: ago(3 * HOUR),
    read: true,
  },
  {
    id: 'n4',
    type: 'MENTION',
    actor: user('u3'),
    postThumbnailUrl: 'm_p4_1',
    previewText: '회원님을 언급했습니다: @yourname 이 사진 어때요?',
    createdAt: ago(DAY),
    read: true,
  },
  {
    id: 'n5',
    type: 'LIKE',
    actor: user('u8'),
    postThumbnailUrl: 'm_p6_1',
    previewText: '회원님의 게시물을 좋아합니다',
    createdAt: ago(2 * DAY),
    read: true,
  },
  {
    id: 'n6',
    type: 'FOLLOW',
    actor: user('u4'),
    postThumbnailUrl: null,
    previewText: '회원님을 팔로우하기 시작했습니다',
    createdAt: ago(3 * DAY),
    read: true,
  },
];

export const threads: ChatThread[] = [
  {
    id: 't1',
    peer: user('u1'),
    lastMessage: '그 카페 위치 공유해줄 수 있어요?',
    lastMessageAt: ago(5 * MIN),
    unreadCount: 2,
  },
  {
    id: 't2',
    peer: user('u5'),
    lastMessage: '내일 아침 같이 뛰어요 🏃',
    lastMessageAt: ago(40 * MIN),
    unreadCount: 0,
  },
  {
    id: 't3',
    peer: user('u7'),
    lastMessage: '그 라이브러리 링크 고마워요!',
    lastMessageAt: ago(3 * HOUR),
    unreadCount: 0,
  },
  {
    id: 't4',
    peer: user('u8'),
    lastMessage: '다음 여행지 추천 좀요 ✈️',
    lastMessageAt: ago(DAY),
    unreadCount: 1,
  },
];

export function messagesFor(threadId: string): Message[] {
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return [];
  const peer = thread.peer.id;
  return [
    {
      id: `${threadId}_m1`,
      threadId,
      senderId: peer,
      body: '안녕하세요! 피드 잘 보고 있어요',
      sentAt: ago(2 * HOUR),
      mine: false,
    },
    {
      id: `${threadId}_m2`,
      threadId,
      senderId: me.id,
      body: '앗 감사합니다 😄',
      sentAt: ago(2 * HOUR - MIN),
      mine: true,
    },
    {
      id: `${threadId}_m3`,
      threadId,
      senderId: peer,
      body: '혹시 그 사진 어디서 찍으신 거예요?',
      sentAt: ago(HOUR),
      mine: false,
    },
    {
      id: `${threadId}_m4`,
      threadId,
      senderId: me.id,
      body: '성수동 골목이에요! 위치 보내드릴게요',
      sentAt: ago(55 * MIN),
      mine: true,
    },
    {
      id: `${threadId}_m5`,
      threadId,
      senderId: peer,
      body: thread.lastMessage,
      sentAt: ago(5 * MIN),
      mine: false,
    },
  ];
}

/** 검색 화면 인기 태그 */
export const trendingTags: string[] = [
  '일상',
  '카페투어',
  '러닝',
  '필름카메라',
  '여행',
  '독서',
  '홈카페',
  '성수동',
  '야경',
  '식물',
];
