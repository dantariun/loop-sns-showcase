import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { Bell, Home, Search, User } from 'lucide-react-native';
import { repositories } from '@/data';
import { qk } from '@/data/query-keys';
import { useThemeColor } from '@/shared/lib/use-theme-color';

/**
 * 바텀 탭 4개. 메시지는 피드 상단에서, 설정은 프로필에서 들어간다 —
 * 탭은 자주 쓰는 목적지만 남긴다.
 */
export default function TabsLayout() {
  const active = useThemeColor('content');
  const inactive = useThemeColor('content-disabled');
  const bg = useThemeColor('bg');
  const border = useThemeColor('border');

  const { data: unread = 0 } = useQuery({
    queryKey: qk.notifications.unreadCount(),
    queryFn: () => repositories.notifications.unreadCount(),
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => <Search size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: '활동',
          tabBarIcon: ({ color }) => <Bell size={26} color={color} />,
          tabBarBadge: unread > 0 ? unread : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
