import { useLocalSearchParams } from 'expo-router';
import { ProfileView } from '@/features/profile/profile-view';

/** 타인 프로필 — 피드·검색·댓글 어디서든 들어온다 */
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProfileView userId={id} showBack />;
}
