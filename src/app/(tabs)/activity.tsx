import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { AppNotification } from '@/entities';
import { useMarkAllRead, useNotifications } from '@/features/activity/use-notifications';
import { relativeTime } from '@/shared/lib/relative-time';
import { AppBar, Avatar, EmptyState, LoadingState, MediaBox, Screen } from '@/shared/ui';

export default function ActivityScreen() {
  const { data, isPending } = useNotifications();
  const markAllRead = useMarkAllRead();

  // 탭에 들어온 순간 읽음 처리 — 배지도 같이 사라진다
  const { mutate: markRead } = markAllRead;
  useEffect(() => {
    markRead();
  }, [markRead]);

  return (
    <Screen>
      <AppBar title="활동" />

      {isPending ? (
        <LoadingState />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => <NotificationRow notification={item} />}
          ListEmptyComponent={<EmptyState title="새 활동이 없습니다" />}
        />
      )}
    </Screen>
  );
}

function NotificationRow({ notification }: { notification: AppNotification }) {
  const router = useRouter();

  return (
    <Pressable
      className={`flex-row items-center gap-3 px-screen py-3 ${
        notification.read ? '' : 'bg-brand/5'
      }`}
      onPress={() => router.push(`/profile/${notification.actor.id}`)}
    >
      <Avatar
        seed={notification.actor.id}
        name={notification.actor.displayName}
        size="sm"
        ring={!notification.read}
      />

      <View className="flex-1">
        <Text className="text-sm leading-5 text-content">
          <Text className="font-semibold">{notification.actor.displayName}</Text>
          <Text className="text-content-secondary">{` ${notification.previewText}`}</Text>
        </Text>
        <Text className="mt-0.5 text-xs text-content-disabled">
          {relativeTime(notification.createdAt)} 전
        </Text>
      </View>

      {notification.postThumbnailUrl ? (
        <View className="h-11 w-11 overflow-hidden rounded">
          <MediaBox seed={notification.postThumbnailUrl} />
        </View>
      ) : null}
    </Pressable>
  );
}
