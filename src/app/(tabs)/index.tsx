import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import type { Post } from '@/entities';
import { useFeedScroll } from '@/features/feed/feed-scroll';
import { PostCard } from '@/features/feed/post-card';
import { useFeed } from '@/features/feed/use-feed';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { AppBar, EmptyState, ErrorState, LoadingState, Screen } from '@/shared/ui';

export default function FeedScreen() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useFeed();
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<Post>>(null);
  const pendingScrollTop = useFeedScroll((s) => s.pending);
  const consumeScrollTop = useFeedScroll((s) => s.consume);
  const iconColor = useThemeColor('content');
  const brand = useThemeColor('brand');

  /*
   * 글을 올리고 돌아오면 방금 쓴 글로 올려 준다.
   *
   * FlashList 는 maintainVisibleContentPosition 이 기본이라 앞에 글이 끼어들어도
   * 보던 위치를 지킨다 — 새 글이 화면 위로 밀려 안 보인다. 포커스 시점이 아니라
   * **갱신된 data 가 도착한 뒤** 올려야 한다. 포커스가 먼저 오면 옛 목록의 맨 위로
   * 갔다가 새 글이 다시 위로 끼어들어 제자리가 된다.
   */
  useEffect(() => {
    if (!pendingScrollTop || !data?.length) return;
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    consumeScrollTop();
  }, [pendingScrollTop, data, consumeScrollTop]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <Screen>
      <AppBar
        wordmark
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메시지"
            hitSlop={8}
            onPress={() => router.push('/chat')}
          >
            <MessageSquare size={24} color={iconColor} />
          </Pressable>
        }
      />

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <FlashList
          ref={listRef}
          data={data}
          // 거의 맨 위를 보고 있을 때 글이 추가되면 따라 올라간다
          maintainVisibleContentPosition={{ autoscrollToTopThreshold: 200 }}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={<EmptyState title="아직 게시물이 없습니다" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand} />
          }
        />
      )}
    </Screen>
  );
}
