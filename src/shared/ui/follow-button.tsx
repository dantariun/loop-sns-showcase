import { ActivityIndicator, Pressable, Text } from 'react-native';
import { cn } from '../lib/cn';

interface FollowButtonProps {
  following: boolean;
  onPress: () => void;
  pending?: boolean;
  /** 프로필 상단처럼 가로를 꽉 채워야 할 때 */
  block?: boolean;
  className?: string;
}

/** 팔로우 / 팔로잉 토글. 어느 화면에서 눌러도 같은 모양·같은 문구를 쓴다. */
export function FollowButton({
  following,
  onPress,
  pending = false,
  block = false,
  className,
}: FollowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: following, busy: pending }}
      accessibilityLabel={following ? '팔로잉' : '팔로우'}
      onPress={onPress}
      disabled={pending}
      className={cn(
        'h-8 items-center justify-center rounded-lg px-4',
        following ? 'bg-surface border border-border' : 'bg-brand',
        block && 'h-10 flex-1',
        pending && 'opacity-60',
        className,
      )}
    >
      {pending ? (
        <ActivityIndicator size="small" color={following ? '#8A8A93' : '#FFFFFF'} />
      ) : (
        <Text className={cn('text-sm font-semibold', following ? 'text-content' : 'text-white')}>
          {following ? '팔로잉' : '팔로우'}
        </Text>
      )}
    </Pressable>
  );
}
