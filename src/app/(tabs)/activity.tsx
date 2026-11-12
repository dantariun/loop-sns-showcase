import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { AppNotification } from '@/entities';
import { ActivityTabs } from '@/features/activity/activity-tabs';
import { type ActivityTab, filterByTab, unreadTabs } from '@/features/activity/tabs';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useRemoveNotification,
} from '@/features/activity/use-notifications';
import { cn } from '@/shared/lib/cn';
import { relativeTime } from '@/shared/lib/relative-time';
import { AppBar, Avatar, EmptyState, LoadingState, MediaBox, Screen } from '@/shared/ui';

export default function ActivityScreen() {
  const [tab, setTab] = useState<ActivityTab>('ALL');

  const { data, isPending } = useNotifications();
  const markAllRead = useMarkAllRead();

  const list = useMemo(() => data ?? [], [data]);
  const visible = useMemo(() => filterByTab(list, tab), [list, tab]);
  const unread = useMemo(() => unreadTabs(list), [list]);

  return (
    <Screen>
      <AppBar
        title="활동"
        right={
          unread.size > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="모두 읽음 처리"
              hitSlop={8}
              onPress={() => markAllRead.mutate()}
            >
              <Text className="text-[13px] font-semibold text-brand">모두 읽음</Text>
            </Pressable>
          ) : null
        }
      />

      <ActivityTabs current={tab} unread={unread} onSelect={setTab} />

      {isPending ? (
        <LoadingState />
      ) : (
        <FlashList
          data={visible}
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
  const markRead = useMarkRead();
  const remove = useRemoveNotification();

  const open = () => {
    if (!notification.read) markRead.mutate(notification.id);
    router.push(`/profile/${notification.actor.id}`);
  };

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, translation) => (
        <DeleteAction translation={translation} onPress={() => remove.mutate(notification.id)} />
      )}
    >
      <Pressable
        className={cn(
          'flex-row items-center gap-3 px-screen py-3',
          // 스와이프로 아래 삭제 버튼이 드러나므로 행에 배경이 반드시 있어야 한다
          notification.read ? 'bg-bg' : 'bg-brand/5',
        )}
        onPress={open}
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
    </ReanimatedSwipeable>
  );
}

const ACTION_WIDTH = 80;

/**
 * 스와이프로 드러나는 삭제 버튼.
 *
 * 고정 폭으로 두면 끌어당긴 만큼 버튼이 늘어나 아이콘이 가장자리에 붙는다.
 * 드래그 거리를 그대로 폭으로 삼고 아이콘은 가운데 둔다.
 */
function DeleteAction({
  translation,
  onPress,
}: {
  translation: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => ({
    width: Math.max(ACTION_WIDTH, -translation.value),
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림 삭제"
        onPress={onPress}
        className="h-full items-center justify-center bg-like"
      >
        <Trash2 size={20} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}
