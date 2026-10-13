import { useRouter } from 'expo-router';
import { Bookmark, Grid3x3, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useBookmarks, usePostsBy } from '@/features/feed/use-feed';
import { compactCount } from '@/shared/lib/format';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import {
  AppBar,
  Avatar,
  EmptyState,
  FollowButton,
  LoadingState,
  MediaBox,
  Screen,
} from '@/shared/ui';
import { useToggleFollow, useUser } from './use-users';

type Tab = 'posts' | 'saved';

/** 내 프로필과 타인 프로필이 공유하는 본체. 다른 점은 상단 액션뿐이다. */
export function ProfileView({ userId, showBack = false }: { userId: string; showBack?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('posts');

  const { data: user, isPending } = useUser(userId);
  const { data: posts = [] } = usePostsBy(userId);
  const { data: saved = [] } = useBookmarks();
  const toggleFollow = useToggleFollow();

  const iconColor = useThemeColor('content');
  const mutedColor = useThemeColor('content-disabled');

  if (isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <AppBar showBack={showBack} title="프로필" />
        <EmptyState title="사용자를 찾을 수 없습니다" />
      </Screen>
    );
  }

  const grid = tab === 'posts' ? posts : saved;

  return (
    <Screen>
      <AppBar
        showBack={showBack}
        title={`@${user.handle}`}
        right={
          user.isMe ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="설정"
              hitSlop={8}
              onPress={() => router.push('/settings')}
            >
              <Settings size={22} color={iconColor} />
            </Pressable>
          ) : null
        }
      />

      <FlatList
        data={grid}
        numColumns={3}
        keyExtractor={(post) => post.id}
        columnWrapperStyle={{ gap: 2 }}
        contentContainerStyle={{ gap: 2 }}
        renderItem={({ item }) => (
          <Pressable className="flex-1" onPress={() => router.push(`/post/${item.id}`)}>
            <MediaBox seed={item.mediaUrls[0] ?? item.id} />
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState title={tab === 'posts' ? '게시물이 없습니다' : '저장한 게시물이 없습니다'} />
        }
        ListHeaderComponent={
          <View>
            {/* 아바타 + 지표 */}
            <View className="flex-row items-center gap-6 px-screen pt-4">
              <Avatar seed={user.id} name={user.displayName} size="lg" />
              <View className="flex-1 flex-row justify-around">
                <Metric label="게시물" value={user.postCount} />
                <Metric label="팔로워" value={user.followerCount} />
                <Metric label="팔로잉" value={user.followingCount} />
              </View>
            </View>

            {/* 소개 */}
            <View className="px-screen pt-3">
              <Text className="text-sm font-bold text-content">{user.displayName}</Text>
              {user.bio ? (
                <Text className="mt-0.5 text-sm leading-5 text-content-secondary">{user.bio}</Text>
              ) : null}
            </View>

            {/* 액션 */}
            <View className="flex-row gap-2 px-screen pt-4">
              {user.isMe ? (
                <Pressable className="h-10 flex-1 items-center justify-center rounded-lg bg-surface">
                  <Text className="text-sm font-semibold text-content">프로필 편집</Text>
                </Pressable>
              ) : (
                <>
                  <FollowButton
                    block
                    following={user.isFollowing}
                    pending={toggleFollow.isPending}
                    onPress={() => toggleFollow.mutate(user.id)}
                  />
                  <Pressable
                    className="h-10 flex-1 items-center justify-center rounded-lg bg-surface"
                    onPress={() => router.push('/chat')}
                  >
                    <Text className="text-sm font-semibold text-content">메시지</Text>
                  </Pressable>
                </>
              )}
            </View>

            {/* 탭 */}
            <View className="mt-4 flex-row border-b border-border">
              <TabButton active={tab === 'posts'} onPress={() => setTab('posts')}>
                <Grid3x3 size={22} color={tab === 'posts' ? iconColor : mutedColor} />
              </TabButton>
              <TabButton active={tab === 'saved'} onPress={() => setTab('saved')}>
                <Bookmark size={22} color={tab === 'saved' ? iconColor : mutedColor} />
              </TabButton>
            </View>
          </View>
        }
      />
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-base font-bold text-content">{compactCount(value)}</Text>
      <Text className="text-xs text-content-hint">{label}</Text>
    </View>
  );
}

function TabButton({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`flex-1 items-center py-3 ${active ? 'border-b-2 border-content' : ''}`}
    >
      {children}
    </Pressable>
  );
}
