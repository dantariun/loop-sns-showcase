import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useThemeColor } from '../lib/use-theme-color';

interface AppBarProps {
  title?: string;
  /** 브랜드 워드마크를 제목 대신 */
  wordmark?: boolean;
  showBack?: boolean;
  right?: ReactNode;
}

/** 화면 상단 바. 뒤로가기·제목·우측 액션의 배치를 한곳에서 통일한다. */
export function AppBar({ title, wordmark = false, showBack = false, right }: AppBarProps) {
  const router = useRouter();
  const iconColor = useThemeColor('content');

  return (
    <View className="h-14 flex-row items-center justify-between border-b border-border px-screen">
      <View className="min-w-0 flex-1 flex-row items-center gap-1">
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={8}
            onPress={() => router.back()}
            className="-ml-2 h-10 w-10 items-center justify-center"
          >
            <ChevronLeft size={26} color={iconColor} />
          </Pressable>
        ) : null}

        {wordmark ? (
          <Text className="text-2xl font-black tracking-tight text-brand">Loop</Text>
        ) : (
          <Text numberOfLines={1} className="text-lg font-bold text-content">
            {title}
          </Text>
        )}
      </View>

      {right ? <View className="flex-row items-center gap-3">{right}</View> : null}
    </View>
  );
}
