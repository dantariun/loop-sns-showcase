import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import { LoopMark } from '@/features/splash/loop-mark';
import { Screen } from '@/shared/ui';

/** 브랜드 화면이 한 프레임 만에 사라지며 깜빡이지 않도록 하는 최소 노출 시간 */
const MIN_HOLD_MS = 1400;

SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 경우 — 무시해도 안전하다
});

/**
 * 첫 진입 화면.
 *
 * 홈에 필요한 데이터를 미리 받아 두고 탭으로 넘긴다. 더미 저장소는 즉시 응답하지만
 * 실제 API 가 붙어도 기다리는 자리는 여기 그대로다.
 */
export default function SplashRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const handedOff = useRef(false);

  // 탭·당겨서 준비 완료 중 먼저 온 쪽 한 번만 넘어간다
  const handOff = useCallback(() => {
    if (handedOff.current) return;
    handedOff.current = true;
    SplashScreen.hideAsync().catch(() => {});
    router.replace('/(tabs)');
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const warmUp = async () => {
      const startedAt = Date.now();

      // 홈이 첫 프레임에 바로 그려지도록 피드를 미리 채운다
      await queryClient.prefetchQuery({
        queryKey: qk.posts.feed(),
        queryFn: () => repositories.feed.feed(),
      });

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_HOLD_MS) {
        await new Promise((r) => setTimeout(r, MIN_HOLD_MS - elapsed));
      }
      if (!cancelled) setReady(true);
    };

    warmUp();
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  useEffect(() => {
    if (ready) handOff();
  }, [ready, handOff]);

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable className="flex-1 items-center justify-center" onPress={handOff}>
        <LoopMark spinning={!ready} />

        <Animated.View entering={FadeIn.duration(600).delay(120)} className="items-center">
          <Text className="mt-6 text-3xl font-black tracking-tight text-content">Loop</Text>
          <Text className="mt-2.5 text-sm text-content-hint">이어지는 순간들</Text>
        </Animated.View>
      </Pressable>

      <View className="items-center pb-10">
        <Text className="text-xs text-content-disabled">v 1.0.0</Text>
      </View>
    </Screen>
  );
}
