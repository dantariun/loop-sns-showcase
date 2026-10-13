import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { User } from '@/entities';
import { Avatar, FollowButton } from '@/shared/ui';
import { useToggleFollow } from './use-users';

/** 사용자 한 줄 — 검색 추천·팔로워·팔로잉 목록이 공유한다 */
export function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const toggleFollow = useToggleFollow();

  return (
    <Pressable
      className="flex-row items-center gap-3 px-screen py-2.5"
      onPress={() => router.push(`/profile/${user.id}`)}
    >
      <Avatar seed={user.id} name={user.displayName} size="sm" />

      <View className="flex-1">
        <Text className="text-sm font-semibold text-content">{user.displayName}</Text>
        <Text numberOfLines={1} className="text-xs text-content-hint">
          @{user.handle}
          {user.bio ? ` · ${user.bio.split('\n')[0]}` : ''}
        </Text>
      </View>

      {user.isMe ? null : (
        <FollowButton
          following={user.isFollowing}
          pending={toggleFollow.isPending && toggleFollow.variables === user.id}
          onPress={() => toggleFollow.mutate(user.id)}
        />
      )}
    </Pressable>
  );
}
