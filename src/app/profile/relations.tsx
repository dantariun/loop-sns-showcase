import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFollowers, useFollowing, useUser } from '@/features/profile/use-users';
import { UserRow } from '@/features/profile/user-row';
import { cn } from '@/shared/lib/cn';
import { compactCount } from '@/shared/lib/format';
import { AppBar, EmptyState, LoadingState, Screen } from '@/shared/ui';

type RelationTab = 'followers' | 'following';

/**
 * 팔로워 · 팔로잉 목록.
 *
 * 두 목록을 한 화면에 두는 이유: 사용자는 둘 사이를 자주 왕복한다.
 * 화면을 나눠 두면 그때마다 스택이 쌓인다.
 *
 * 어느 탭으로 들어왔는지는 프로필의 지표를 누른 쪽이 정한다.
 */
export default function RelationsScreen() {
  const params = useLocalSearchParams<{ userId?: string; tab?: string }>();
  const userId = params.userId ?? '';

  const [tab, setTab] = useState<RelationTab>(
    params.tab === 'following' ? 'following' : 'followers',
  );

  const { data: user } = useUser(userId);
  const followers = useFollowers(userId);
  const following = useFollowing(userId);

  const active = tab === 'followers' ? followers : following;
  const list = active.data ?? [];

  return (
    <Screen>
      <AppBar showBack title={user ? `@${user.handle}` : ''} />

      <View className="flex-row border-b border-border">
        <TabButton
          label="팔로워"
          count={user?.followerCount}
          active={tab === 'followers'}
          onPress={() => setTab('followers')}
        />
        <TabButton
          label="팔로잉"
          count={user?.followingCount}
          active={tab === 'following'}
          onPress={() => setTab('following')}
        />
      </View>

      {active.isPending ? (
        <LoadingState />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserRow user={item} />}
          ListEmptyComponent={
            <EmptyState
              title={tab === 'followers' ? '팔로워가 없습니다' : '팔로잉이 없습니다'}
              description={
                tab === 'followers'
                  ? '게시물을 올리면 사람들이 찾아옵니다'
                  : '마음에 드는 사용자를 팔로우해 보세요'
              }
            />
          }
        />
      )}
    </Screen>
  );
}

function TabButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={cn('flex-1 items-center py-3', active && 'border-b-2 border-content')}
    >
      <Text
        className={cn(
          'text-[15px]',
          active ? 'font-bold text-content' : 'font-medium text-content-hint',
        )}
      >
        {label}
        {count === undefined ? '' : ` ${compactCount(count)}`}
      </Text>
    </Pressable>
  );
}
