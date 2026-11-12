import { db, resetDb } from './db';
import { fakeRepositories } from './fake-repositories';

const { feed, users, chat, notifications, search } = fakeRepositories;

// 저장소는 모듈 전역 상태다 — 케이스마다 시드로 되돌려 서로 간섭하지 않게 한다
beforeEach(resetDb);

describe('FeedRepository', () => {
  it('피드는 최신순으로 내려온다', async () => {
    const posts = await feed.feed();
    const times = posts.map((p) => p.createdAt);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('좋아요를 토글하면 수와 상태가 함께 움직인다', async () => {
    const before = await feed.post('p1');
    const after = await feed.toggleLike('p1');

    expect(after.liked).toBe(!before?.liked);
    expect(after.likeCount).toBe((before?.likeCount ?? 0) + 1);

    const back = await feed.toggleLike('p1');
    expect(back.likeCount).toBe(before?.likeCount);
  });

  it('댓글을 달면 게시물의 댓글 수도 올라간다', async () => {
    const before = await feed.post('p1');
    await feed.addComment('p1', '테스트 댓글');

    const after = await feed.post('p1');
    const comments = await feed.comments('p1');

    expect(after?.commentCount).toBe((before?.commentCount ?? 0) + 1);
    expect(comments.at(-1)?.body).toBe('테스트 댓글');
  });

  it('북마크 목록은 북마크된 것만 담는다', async () => {
    await feed.toggleBookmark('p1');
    const bookmarks = await feed.bookmarks();
    expect(bookmarks.every((p) => p.bookmarked)).toBe(true);
    expect(bookmarks.map((p) => p.id)).toContain('p1');
  });
});

describe('UserRepository', () => {
  it('팔로우를 토글하면 그 사용자가 박힌 게시물에도 반영된다', async () => {
    const before = await users.user('u2');
    expect(before?.isFollowing).toBe(false);

    await users.toggleFollow('u2');

    const after = await users.user('u2');
    expect(after?.isFollowing).toBe(true);
    expect(after?.followerCount).toBe((before?.followerCount ?? 0) + 1);

    // 피드에 들어 있는 같은 사용자도 같이 갱신돼야 화면 간에 어긋나지 않는다
    const post = await feed.post('p1');
    expect(post?.author.isFollowing).toBe(true);
  });

  it('팔로우하면 내 팔로잉 수가 늘어난다', async () => {
    const before = await users.me();
    await users.toggleFollow('u2');
    const after = await users.me();
    expect(after.followingCount).toBe(before.followingCount + 1);
  });

  it('프로필을 수정하면 내가 쓴 게시물의 작성자 이름도 바뀐다', async () => {
    const me = await users.me();
    await feed.createPost({ mediaIds: [], body: '내 글', hashtags: [], locationTag: null });

    await users.updateMe({ handle: 'newhandle', displayName: '새이름', bio: '새 소개' });

    const after = await users.me();
    expect(after.handle).toBe('newhandle');
    expect(after.displayName).toBe('새이름');

    // 작성자는 게시물에 복사돼 들어가 있다 — 같이 갱신되지 않으면 화면끼리 어긋난다
    const mine = await feed.postsBy(me.id);
    expect(mine.every((post) => post.author.displayName === '새이름')).toBe(true);
  });

  it('앞뒤 공백은 저장 전에 잘라낸다', async () => {
    const after = await users.updateMe({
      handle: '  spaced  ',
      displayName: '  이름  ',
      bio: '  소개  ',
    });

    expect(after.handle).toBe('spaced');
    expect(after.displayName).toBe('이름');
    expect(after.bio).toBe('소개');
  });

  it('남이 쓰는 아이디로는 바꿀 수 없다', async () => {
    const other = await users.user('u1');
    const before = await users.me();

    await expect(
      users.updateMe({
        handle: other?.handle ?? '',
        displayName: before.displayName,
        bio: before.bio,
      }),
    ).rejects.toThrow('이미 사용 중인 아이디입니다');

    // 거절됐으면 아무것도 바뀌지 않아야 한다
    const after = await users.me();
    expect(after.handle).toBe(before.handle);
  });
});

describe('NotificationRepository', () => {
  it('모두 읽음 처리하면 미읽음이 0 이 된다', async () => {
    expect(await notifications.unreadCount()).toBeGreaterThan(0);
    await notifications.markAllRead();
    expect(await notifications.unreadCount()).toBe(0);
  });

  it('한 건만 읽으면 미읽음이 그만큼만 줄어든다', async () => {
    const before = await notifications.unreadCount();
    const target = (await notifications.notifications()).find((n) => !n.read);
    if (!target) throw new Error('미읽음 알림이 시드에 없습니다');

    const next = await notifications.markRead(target.id);

    expect(next.read).toBe(true);
    expect(await notifications.unreadCount()).toBe(before - 1);
  });

  it('삭제하면 목록에서 빠지고 미읽음도 함께 줄어든다', async () => {
    const before = await notifications.unreadCount();
    const target = (await notifications.notifications()).find((n) => !n.read);
    if (!target) throw new Error('미읽음 알림이 시드에 없습니다');

    await notifications.remove(target.id);

    const list = await notifications.notifications();
    expect(list.map((n) => n.id)).not.toContain(target.id);
    expect(await notifications.unreadCount()).toBe(before - 1);
  });
});

describe('ChatRepository', () => {
  it('메시지를 보내면 목록의 마지막 메시지가 바뀐다', async () => {
    await chat.send('t1', '안녕하세요');

    const messages = await chat.messages('t1');
    const threads = await chat.threads();
    const thread = threads.find((t) => t.id === 't1');

    expect(messages.at(-1)?.body).toBe('안녕하세요');
    expect(messages.at(-1)?.mine).toBe(true);
    expect(thread?.lastMessage).toBe('안녕하세요');
  });

  it('방을 열면 읽지 않은 수가 0 이 된다', async () => {
    expect(db.threads.find((t) => t.id === 't1')?.unreadCount).toBeGreaterThan(0);
    await chat.messages('t1');
    expect(db.threads.find((t) => t.id === 't1')?.unreadCount).toBe(0);
  });
});

describe('SearchRepository', () => {
  it('빈 검색어는 질의하지 않고 빈 배열을 돌려준다', async () => {
    expect(await search.searchUsers('   ')).toEqual([]);
    expect(await search.searchPosts('')).toEqual([]);
  });

  it('핸들과 표시 이름을 모두 뒤진다', async () => {
    expect((await search.searchUsers('seoul')).map((u) => u.id)).toContain('u2');
    expect((await search.searchUsers('서울')).map((u) => u.id)).toContain('u2');
  });

  it('본문과 해시태그로 게시물을 찾는다', async () => {
    expect((await search.searchPosts('노을')).map((p) => p.id)).toContain('p1');
    expect((await search.searchPosts('카페투어')).map((p) => p.id)).toContain('p2');
  });

  it('탐색 그리드에는 미디어가 있는 게시물만 들어간다', async () => {
    const explore = await search.explore();
    expect(explore.every((p) => p.mediaUrls.length > 0)).toBe(true);
  });
});

describe('createPost', () => {
  it('새 글은 내가 작성자이고 피드 맨 앞에 선다', async () => {
    const created = await feed.createPost({
      mediaIds: ['m_gallery_1', 'm_gallery_2'],
      body: '첫 글 #테스트',
      hashtags: ['테스트'],
      locationTag: '성수동',
    });

    expect(created.author.isMe).toBe(true);
    expect(created.mediaUrls).toEqual(['m_gallery_1', 'm_gallery_2']);
    expect(created.locationTag).toBe('성수동');

    const posts = await feed.feed();
    expect(posts[0]?.id).toBe(created.id);
  });

  it('등록하면 내 게시물 수가 늘고 프로필 그리드에 들어간다', async () => {
    const before = await users.me();
    const created = await feed.createPost({
      mediaIds: ['m_gallery_3'],
      body: '두 번째',
      hashtags: [],
      locationTag: null,
    });

    const after = await users.me();
    const mine = await feed.postsBy(after.id);

    expect(after.postCount).toBe(before.postCount + 1);
    expect(mine.map((p) => p.id)).toContain(created.id);
  });

  it('새 글에도 댓글을 달 수 있다', async () => {
    const created = await feed.createPost({
      mediaIds: [],
      body: '댓글 받을 글',
      hashtags: [],
      locationTag: null,
    });

    await feed.addComment(created.id, '축하해요');
    const comments = await feed.comments(created.id);

    expect(comments.map((c) => c.body)).toEqual(['축하해요']);
  });
});
