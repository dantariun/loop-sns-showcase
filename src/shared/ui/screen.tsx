import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '../lib/cn';

interface ScreenProps {
  children: ReactNode;
  /** 안전영역을 적용할 변. 탭 화면은 하단을 탭 바에 양보한다 */
  edges?: readonly Edge[];
  className?: string;
}

/** 모든 화면의 바깥 껍데기 — 배경색과 안전영역을 한곳에서 책임진다 */
export function Screen({ children, edges = ['top'], className }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-bg', className)}>
      {children}
    </SafeAreaView>
  );
}

/** 목록을 불러오는 동안 */
export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator color="#5B5BF5" />
    </View>
  );
}

/** 결과가 없을 때 */
export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View className="items-center justify-center px-10 py-20">
      <Text className="text-center text-base font-semibold text-content">{title}</Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm text-content-hint">{description}</Text>
      ) : null}
    </View>
  );
}

/** 불러오기에 실패했을 때 */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <View className="items-center justify-center px-10 py-20">
      <Text className="text-center text-base font-semibold text-content">불러오지 못했습니다</Text>
      {onRetry ? (
        <Text onPress={onRetry} className="mt-2 text-sm font-semibold text-brand">
          다시 시도
        </Text>
      ) : null}
    </View>
  );
}
