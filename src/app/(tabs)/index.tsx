import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { PostCard } from '@/features/feed/post-card';
import { useFeed } from '@/features/feed/use-feed';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { AppBar, EmptyState, ErrorState, LoadingState, Screen } from '@/shared/ui';

export default function FeedScreen() {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useFeed();
  const [refreshing, setRefreshing] = useState(false);
  const iconColor = useThemeColor('content');
  const brand = useThemeColor('brand');

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
          data={data}
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
