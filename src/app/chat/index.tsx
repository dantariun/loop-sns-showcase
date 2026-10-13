import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useThreads } from '@/features/chat/use-chat';
import { relativeTime } from '@/shared/lib/relative-time';
import { AppBar, Avatar, EmptyState, LoadingState, Screen } from '@/shared/ui';

export default function ChatListScreen() {
  const router = useRouter();
  const { data, isPending } = useThreads();

  return (
    <Screen>
      <AppBar showBack title="메시지" />

      {isPending ? (
        <LoadingState />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(t) => t.id}
          ListEmptyComponent={<EmptyState title="대화가 없습니다" />}
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-center gap-3 px-screen py-3"
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <Avatar seed={item.peer.id} name={item.peer.displayName} size="md" />

              <View className="flex-1">
                <Text className="text-sm font-semibold text-content">{item.peer.displayName}</Text>
                <Text
                  numberOfLines={1}
                  className={
                    item.unreadCount > 0
                      ? 'text-sm font-medium text-content'
                      : 'text-sm text-content-hint'
                  }
                >
                  {item.lastMessage}
                </Text>
              </View>

              <View className="items-end gap-1">
                <Text className="text-xs text-content-disabled">
                  {relativeTime(item.lastMessageAt)}
                </Text>
                {item.unreadCount > 0 ? (
                  <View className="h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5">
                    <Text className="text-xs font-bold text-white">{item.unreadCount}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
