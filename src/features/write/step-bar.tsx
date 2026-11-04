import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';

export const WRITE_STEPS = ['미디어', '미리보기', '본문'] as const;

export type WriteStep = 0 | 1 | 2;

/**
 * 3단계 진행 표시.
 *
 * 뒤 단계는 앞 단계가 끝나야 열린다 — 미디어 없이 본문으로 갈 수 없다.
 * 그 규칙을 화면이 아니라 여기서 눈에 보이게 만든다.
 */
export function StepBar({ current }: { current: WriteStep }) {
  return (
    <View className="flex-row items-center gap-2 px-screen pb-3">
      {WRITE_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} className="flex-1 flex-row items-center gap-2">
            <View className="flex-1">
              <View className={cn('h-1 rounded-full', done || active ? 'bg-brand' : 'bg-border')} />
              <Text
                className={cn(
                  'mt-1.5 text-[11px]',
                  active ? 'font-semibold text-brand' : 'text-content-hint',
                )}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
