import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useDraft } from '@/features/write/draft-store';
import { StepBar } from '@/features/write/step-bar';
import { cn } from '@/shared/lib/cn';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { MediaBox, MediaDots, Screen } from '@/shared/ui';

/** 2단계 — 고른 미디어를 게시물에 실릴 크기로 확인하고 순서를 다시 본다 */
export default function WritePreviewScreen() {
  const router = useRouter();
  const media = useDraft((s) => s.media);
  const toggleMedia = useDraft((s) => s.toggleMedia);
  const [page, setPage] = useState(0);

  const iconColor = useThemeColor('content');
  const width = Dimensions.get('window').width;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
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
        <Text className="text-base font-bold text-content">미리보기</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음"
          onPress={() => router.push('/write/compose')}
        >
          <Text className="text-[15px] font-semibold text-brand">다음</Text>
        </Pressable>
      </View>

      <StepBar current={1} />

      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {media.map((id) => (
            <View key={id} style={{ width }}>
              <MediaBox seed={id} />
            </View>
          ))}
        </ScrollView>
        <MediaDots items={media} index={page} />
      </View>

      {/* 썸네일 줄 — 여기서 빼면 선택이 풀린다.
          가로 ScrollView 는 세로로도 늘어나므로 높이를 묶어 둔다 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View className="flex-row gap-2 px-screen">
          {media.map((id, i) => (
            <Pressable key={id} onPress={() => toggleMedia(id)}>
              <View
                className={cn(
                  'h-16 w-16 overflow-hidden rounded-lg',
                  i === page && 'border-2 border-brand',
                )}
              >
                <MediaBox seed={id} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Text className="px-screen pt-3 text-xs text-content-hint">
        썸네일을 탭하면 선택이 해제됩니다 · 첫 장이 대표 이미지입니다
      </Text>
    </Screen>
  );
}
