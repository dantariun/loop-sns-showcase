import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { PostCard } from '@/features/feed/post-card';
import { useAddComment, useComments, usePost } from '@/features/feed/use-feed';
import { relativeTime } from '@/shared/lib/relative-time';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { AppBar, Avatar, EmptyState, LoadingState, Screen } from '@/shared/ui';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [draft, setDraft] = useState('');

  const { data: post, isPending } = usePost(id);
  const { data: comments = [] } = useComments(id);
  const addComment = useAddComment(id);

  const hintColor = useThemeColor('content-hint');
  const brand = useThemeColor('brand');

  const canSend = draft.trim().length > 0 && !addComment.isPending;

  const submit = () => {
    if (!canSend) return;
    addComment.mutate(draft.trim());
    setDraft('');
  };

  if (isPending) {
    return (
      <Screen>
        <AppBar showBack title="게시물" />
        <LoadingState />
      </Screen>
    );
  }

  if (!post) {
    return (
      <Screen>
        <AppBar showBack title="게시물" />
        <EmptyState title="게시물을 찾을 수 없습니다" />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <AppBar showBack title="게시물" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={<PostCard post={post} />}
          ListEmptyComponent={<EmptyState title="첫 댓글을 남겨보세요" />}
          renderItem={({ item }) => (
            <View className="flex-row gap-3 px-screen py-2.5">
              <Pressable onPress={() => router.push(`/profile/${item.author.id}`)}>
                <Avatar seed={item.author.id} name={item.author.displayName} size="sm" />
              </Pressable>
              <View className="flex-1">
                <Text className="text-sm leading-5 text-content">
                  <Text className="font-semibold">{item.author.displayName}</Text>
                  <Text>{`  ${item.body}`}</Text>
                </Text>
                <Text className="mt-0.5 text-xs text-content-disabled">
                  {relativeTime(item.createdAt)} 전
                  {item.likeCount > 0 ? ` · 좋아요 ${item.likeCount}개` : ''}
                </Text>
              </View>
            </View>
          )}
        />

        {/* 댓글 입력 */}
        <View className="flex-row items-center gap-2 border-t border-border px-screen py-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="댓글 달기…"
            placeholderTextColor={hintColor}
            onSubmitEditing={submit}
            returnKeyType="send"
            className="h-10 flex-1 rounded-full bg-surface px-4 text-[15px] text-content"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="댓글 등록"
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
