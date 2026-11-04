import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { galleryMedia } from '@/data/fake/dummy-data';
import { MAX_MEDIA, useDraft } from '@/features/write/draft-store';
import { StepBar } from '@/features/write/step-bar';
import { cn } from '@/shared/lib/cn';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { MediaBox, Screen } from '@/shared/ui';

/**
 * 1단계 — 미디어 선택.
 *
 * 기기 사진 라이브러리를 읽지 않는다. 이 앱은 자산 없이 도는 쇼케이스라
 * 권한 흐름 대신 시드 그라데이션 타일을 고르게 한다.
 */
export default function WriteMediaScreen() {
  const router = useRouter();
  const media = useDraft((s) => s.media);
  const toggleMedia = useDraft((s) => s.toggleMedia);
  const reset = useDraft((s) => s.reset);

  const iconColor = useThemeColor('content');
  const canGoNext = media.length > 0;

  const close = () => {
    reset();
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View className="h-14 flex-row items-center justify-between px-screen">
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" hitSlop={8} onPress={close}>
          <X size={24} color={iconColor} />
        </Pressable>
        <Text className="text-base font-bold text-content">새 게시물</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음"
          disabled={!canGoNext}
          onPress={() => router.push('/write/preview')}
        >
          <Text
            className={cn(
              'text-[15px] font-semibold',
              canGoNext ? 'text-brand' : 'text-content-disabled',
            )}
          >
            다음
          </Text>
        </Pressable>
      </View>

      <StepBar current={0} />

      <Text className="px-screen pb-2 text-xs text-content-hint">
        {media.length > 0
          ? `${media.length}장 선택 · 최대 ${MAX_MEDIA}장`
          : `사진을 선택하세요 · 최대 ${MAX_MEDIA}장`}
      </Text>

      <FlashList
        data={galleryMedia}
        numColumns={3}
        keyExtractor={(id) => id}
        renderItem={({ item }) => {
          const order = media.indexOf(item);
          const selected = order >= 0;
          return (
            <Pressable className="flex-1 p-px" onPress={() => toggleMedia(item)}>
              <View className={cn(selected && 'opacity-60')}>
                <MediaBox seed={item} />
              </View>

              {/* 선택 순서가 곧 게시물의 미디어 순서다 */}
              <View
                className={cn(
                  'absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full border-2',
                  selected ? 'border-white bg-brand' : 'border-white/90 bg-black/15',
                )}
              >
                {selected ? (
                  <Text className="text-xs font-bold text-white">{order + 1}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
