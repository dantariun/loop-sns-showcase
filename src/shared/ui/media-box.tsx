import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { cn } from '../lib/cn';
import { swatchGradient } from '../lib/swatch';

interface MediaBoxProps {
  /** 그라데이션을 결정하는 시드 — 보통 미디어 id */
  seed: string;
  /** 가로:세로 비율. 피드는 1, 그리드 썸네일도 1 */
  aspectRatio?: number;
  rounded?: boolean;
  className?: string;
}

/**
 * 이미지 자리.
 *
 * 포트폴리오라 실제 이미지 자산이 없다. 시드 그라데이션으로 채워
 * 게시물마다 다른 그림처럼 보이게 하고, 같은 게시물은 늘 같은 색을 낸다.
 */
export function MediaBox({ seed, aspectRatio = 1, rounded = false, className }: MediaBoxProps) {
  const [from, to] = swatchGradient(seed);

  return (
    <View
      className={cn('overflow-hidden', rounded && 'rounded-card', className)}
      style={{ aspectRatio }}
    >
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

/**
 * 여러 장일 때 하단 페이지 인디케이터.
 *
 * 개수가 아니라 미디어 id 목록을 받는다 — 점마다 안정적인 key 가 생기고,
 * 호출부도 이미 들고 있는 값을 그대로 넘기면 된다.
 */
export function MediaDots({ items, index }: { items: string[]; index: number }) {
  if (items.length <= 1) return null;

  return (
    <View className="absolute bottom-3 w-full flex-row items-center justify-center gap-1.5">
      {items.map((id, i) => (
        <View
          key={id}
          className={cn('h-1.5 w-1.5 rounded-full', i === index ? 'bg-white' : 'bg-white/50')}
        />
      ))}
    </View>
  );
}
