import { ProfileView } from '@/features/profile/profile-view';
import { useMe } from '@/features/profile/use-users';
import { LoadingState, Screen } from '@/shared/ui';

/** 프로필 탭 — 내 프로필. 타인 프로필과 같은 본체를 쓴다. */
export default function MyProfileScreen() {
  const { data: me } = useMe();

  if (!me) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return <ProfileView userId={me.id} />;
}
