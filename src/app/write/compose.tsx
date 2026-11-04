import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { trendingTags } from '@/data/fake/dummy-data';
import { useDraft } from '@/features/write/draft-store';
import { activeHashtag, applyHashtag, parseHashtags } from '@/features/write/hashtags';
import { StepBar } from '@/features/write/step-bar';
import { useCreatePost } from '@/features/write/use-create-post';
import { cn } from '@/shared/lib/cn';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { MediaBox, Screen } from '@/shared/ui';

const MAX_BODY = 500;

/** 3단계 — 본문·해시태그·위치. 등록하면 피드 맨 앞에 올라간다. */
export default function WriteComposeScreen() {
  const router = useRouter();
  const media = useDraft((s) => s.media);
  const body = useDraft((s) => s.body);
  const setBody = useDraft((s) => s.setBody);
  const locationTag = useDraft((s) => s.locationTag);
  const reset = useDraft((s) => s.reset);

  const [cursor, setCursor] = useState(0);
  const createPost = useCreatePost();

  const iconColor = useThemeColor('content');
  const hintColor = useThemeColor('content-hint');

  const hashtags = parseHashtags(body);
  const typing = activeHashtag(body, cursor);
  const suggestions =
    typing === null
      ? []
      : trendingTags.filter((t) => t.startsWith(typing) && !hashtags.includes(t)).slice(0, 6);

  const canSubmit = body.trim().length > 0 && !createPost.isPending;

  const pickSuggestion = (tag: string) => {
    const next = applyHashtag(body, cursor, tag);
    setBody(next.body);
    setCursor(next.cursor);
  };

  const submit = () => {
    if (!canSubmit) return;
    createPost.mutate(
      { media, body, locationTag },
      {
        onSuccess: () => {
          reset();
          // dismissAll 은 글쓰기 스택만 비운다 — 모달 자체는 루트 스택에 있어
          // 한 번 더 닫아야 피드로 돌아간다
          router.dismissAll();
          router.back();
        },
      },
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View className="h-14 flex-row items-center justify-between px-screen">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <ChevronLeft size={26} color={iconColor} />
        </Pressable>
        <Text className="text-base font-bold text-content">새 게시물</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="등록"
          disabled={!canSubmit}
          onPress={submit}
        >
          {createPost.isPending ? (
            <ActivityIndicator size="small" color={hintColor} />
          ) : (
            <Text
              className={cn(
                'text-[15px] font-semibold',
                canSubmit ? 'text-brand' : 'text-content-disabled',
              )}
            >
              등록
            </Text>
          )}
        </Pressable>
      </View>

      <StepBar current={2} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* 대표 이미지 + 본문 */}
          <View className="flex-row gap-3 px-screen pt-1">
            <Pressable onPress={() => router.dismissTo('/write')}>
              <View className="h-20 w-20 overflow-hidden rounded-lg">
                <MediaBox seed={media[0] ?? 'empty'} />
              </View>
            </Pressable>

            <TextInput
              value={body}
              onChangeText={(t) => setBody(t.slice(0, MAX_BODY))}
              onSelectionChange={(e) => setCursor(e.nativeEvent.selection.start)}
              placeholder="무슨 일이 있었나요? #태그 로 분류할 수 있어요"
              placeholderTextColor={hintColor}
              multiline
              className="min-h-20 flex-1 text-[15px] leading-[22px] text-content"
            />
          </View>

          <Text className="px-screen pt-1 text-right text-[11px] text-content-disabled">
            {body.length} / {MAX_BODY}
          </Text>

          {/* 입력 중인 해시태그 추천 */}
          {suggestions.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 px-screen pt-2">
              {suggestions.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => pickSuggestion(tag)}
                  className="rounded-full bg-brand/10 px-3 py-1.5"
                >
                  <Text className="text-sm font-medium text-brand">#{tag}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {/* 확정된 해시태그 */}
          {hashtags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 px-screen pt-3">
              {hashtags.map((tag) => (
                <Text key={tag} className="text-sm text-brand">
                  #{tag}
                </Text>
              ))}
            </View>
          ) : null}

          {/* 위치 태그 */}
          <Pressable
            className="mt-5 flex-row items-center gap-3 border-y border-border px-screen py-3.5"
            onPress={() => router.push('/write/location')}
          >
            <MapPin size={20} color={iconColor} />
            <Text
              className={cn(
                'flex-1 text-[15px]',
                locationTag ? 'text-content' : 'text-content-hint',
              )}
            >
              {locationTag ?? '위치 추가'}
            </Text>
            <ChevronRight size={20} color={hintColor} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
