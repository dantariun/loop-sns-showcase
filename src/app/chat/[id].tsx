import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMessages, useSendMessage, useThreads } from '@/features/chat/use-chat';
import { clockTime } from '@/shared/lib/relative-time';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { AppBar, LoadingState, Screen } from '@/shared/ui';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [draft, setDraft] = useState('');

  const { data: threads = [] } = useThreads();
  const { data: messages = [], isPending } = useMessages(id);
  const send = useSendMessage(id);

  const hintColor = useThemeColor('content-hint');
  const brand = useThemeColor('brand');

  const peer = threads.find((t) => t.id === id)?.peer;
  const canSend = draft.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    send.mutate(draft.trim());
    setDraft('');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <AppBar showBack title={peer?.displayName ?? '대화'} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isPending ? (
          <LoadingState />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            renderItem={({ item }) => (
              <View className={item.mine ? 'items-end' : 'items-start'}>
                <View
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                    item.mine ? 'bg-brand' : 'bg-bubble'
                  }`}
                >
                  <Text
                    className={`text-[15px] leading-5 ${item.mine ? 'text-white' : 'text-content'}`}
                  >
                    {item.body}
                  </Text>
                </View>
                <Text className="mt-1 px-1 text-[11px] text-content-disabled">
                  {clockTime(item.sentAt)}
                </Text>
              </View>
            )}
          />
        )}

        {/* 입력 */}
        <View className="flex-row items-center gap-2 border-t border-border px-screen py-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="메시지 입력…"
            placeholderTextColor={hintColor}
            onSubmitEditing={submit}
            returnKeyType="send"
            className="h-10 flex-1 rounded-full bg-surface px-4 text-[15px] text-content"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="전송"
            disabled={!canSend}
            onPress={submit}
            className={canSend ? '' : 'opacity-40'}
          >
            <Send size={22} color={brand} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
