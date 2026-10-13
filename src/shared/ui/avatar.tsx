import { Text, View } from 'react-native';
import { cn } from '../lib/cn';
import { swatchColor, swatchInitial } from '../lib/swatch';

export type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<AvatarSize, number> = { sm: 36, md: 44, lg: 88 };

interface AvatarProps {
  /** 색을 결정하는 시드 — 보통 사용자 id */
  seed: string;
  /** 이니셜을 뽑을 이름 */
  name: string;
  size?: AvatarSize;
  /** 읽지 않은 스토리처럼 테두리를 두를 때 */
  ring?: boolean;
  className?: string;
}

/**
 * 원형 아바타. 더미 단계에서는 시드 색 + 이니셜로 그린다.
 * (실제 URL 이 생기면 여기만 expo-image 로 바꾸면 된다)
 */
export function Avatar({ seed, name, size = 'md', ring = false, className }: AvatarProps) {
  const px = SIZE_PX[size];

  return (
    <View
      className={cn('items-center justify-center', ring && 'border-2 border-brand', className)}
      style={{
        width: px,
        height: px,
        borderRadius: px / 2,
        backgroundColor: swatchColor(seed),
      }}
    >
      <Text className="font-bold text-white" style={{ fontSize: px * 0.4 }}>
        {swatchInitial(name)}
      </Text>
    </View>
  );
}
