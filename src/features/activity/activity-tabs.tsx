import { Pressable, ScrollView, Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { ACTIVITY_TABS, type ActivityTab, TAB_LABEL } from './tabs';

/** dot 지름과 라벨과의 간격 — 탭 높이를 잡을 때 같이 쓴다 */
const DOT_SIZE = 6;
const DOT_GAP = 3;

interface ActivityTabsProps {
  current: ActivityTab;
  unread: Set<ActivityTab>;
  onSelect: (tab: ActivityTab) => void;
}

/**
 * 활동 유형 탭.
 *
 * 균등 분할이 아니라 **글자 폭만큼** 차지하고 좌측부터 늘어선다.
 * 탭이 늘어나도 각 칸이 좁아지지 않고, 넘치면 가로로 스크롤된다.
 *
 * 미읽음 dot 은 라벨 위에 겹쳐 올리지 않고 **위쪽에 자리를 미리 비워 둔다.**
 * 겹쳐 올리면 dot 이 생길 때 라벨이 밀리거나 잘린다.
 */
export function ActivityTabs({ current, unread, onSelect }: ActivityTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // 가로 스크롤뷰도 기본값으로는 세로로 늘어나 아래 목록을 밀어낸다
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
    >
      {ACTIVITY_TABS.map((tab) => {
        const active = tab === current;

        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={
              unread.has(tab) ? `${TAB_LABEL[tab]}, 읽지 않은 알림 있음` : TAB_LABEL[tab]
            }
            onPress={() => onSelect(tab)}
            className="items-start py-2.5"
          >
            {/* dot 자리 — 비어 있어도 높이를 차지한다 */}
            <View style={{ height: DOT_SIZE, marginBottom: DOT_GAP }}>
              {unread.has(tab) ? (
                <View
                  className="rounded-full bg-brand"
                  style={{ width: DOT_SIZE, height: DOT_SIZE }}
                />
              ) : null}
            </View>

            <Text
              className={cn(
                active ? 'text-[17px] font-bold text-content' : 'text-[15px] text-content-hint',
              )}
            >
              {TAB_LABEL[tab]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
