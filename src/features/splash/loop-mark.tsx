import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useThemeColor } from '@/shared/lib/use-theme-color';

const SIZE = 88;
const STROKE = 7;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface LoopMarkProps {
  /** 준비가 끝나면 회전을 멈추고 링을 닫는다 */
  spinning: boolean;
}

/**
 * 브랜드 마크 — 인디고 링 위를 호 하나가 돈다.
 *
 * 이미지 자산 없이 SVG 로만 그린다. 회전은 UI 스레드(Reanimated)에서 돌아
 * 스플래시가 데이터를 기다리는 동안 JS 가 바빠도 끊기지 않는다.
 */
export function LoopMark({ spinning }: LoopMarkProps) {
  const angle = useSharedValue(0);
  const ring = useThemeColor('brand-soft');
  const arc = useThemeColor('brand');

  useEffect(() => {
    if (!spinning) return;
    angle.value = 0;
    angle.value = withRepeat(withTiming(360, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [spinning, angle]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  // 도는 동안에는 링의 약 30% 만 그린다. 끝나면 한 바퀴를 모두 채운다.
  const dash = spinning ? CIRCUMFERENCE * 0.3 : CIRCUMFERENCE;

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      {/* 바탕 링 */}
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={ring} strokeWidth={STROKE} fill="none" />
      </Svg>

      {/* 도는 호 */}
      <Animated.View style={[{ width: SIZE, height: SIZE }, style]}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={arc}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
            // 12시에서 시작하도록 90도 돌린다
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
