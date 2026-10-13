import { ScrollView, Switch, Text, View } from 'react-native';
import { type SettingsToggleKey, useSettings } from '@/features/settings/settings-store';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { AppBar, Screen } from '@/shared/ui';

const SECTIONS: {
  title: string;
  rows: { key: SettingsToggleKey; label: string; hint?: string }[];
}[] = [
  {
    title: '알림',
    rows: [
      { key: 'pushEnabled', label: '푸시 알림', hint: '끄면 아래 항목이 모두 멈춥니다' },
      { key: 'likeNotifications', label: '좋아요' },
      { key: 'commentNotifications', label: '댓글' },
      { key: 'followNotifications', label: '새 팔로워' },
    ],
  },
  {
    title: '화면',
    rows: [{ key: 'reduceMotion', label: '동작 줄이기', hint: '전환 애니메이션을 최소화합니다' }],
  },
];

export default function SettingsScreen() {
  const settings = useSettings();
  const brand = useThemeColor('brand');
  const border = useThemeColor('border');

  return (
    <Screen edges={['top', 'bottom']}>
      <AppBar showBack title="설정" />

      <ScrollView>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text className="px-screen pb-1 pt-5 text-xs font-bold uppercase text-content-hint">
              {section.title}
            </Text>

            {section.rows.map((row) => {
              // 푸시를 끄면 하위 알림 항목은 조작할 수 없다
              const dependent = section.title === '알림' && row.key !== 'pushEnabled';
              const disabled = dependent && !settings.pushEnabled;

              return (
                <View
                  key={row.key}
                  className={`flex-row items-center justify-between border-b border-border px-screen py-3.5 ${
                    disabled ? 'opacity-40' : ''
                  }`}
                >
                  <View className="flex-1 pr-4">
                    <Text className="text-[15px] text-content">{row.label}</Text>
                    {row.hint ? (
                      <Text className="mt-0.5 text-xs text-content-hint">{row.hint}</Text>
                    ) : null}
                  </View>

                  <Switch
                    value={settings[row.key]}
                    onValueChange={() => settings.toggle(row.key)}
                    disabled={disabled}
                    trackColor={{ true: brand, false: border }}
                  />
                </View>
              );
            })}
          </View>
        ))}

        <Text className="px-screen py-8 text-center text-xs text-content-disabled">
          Loop · v 1.0.0{'\n'}더미 데이터로 동작하는 포트폴리오 앱입니다
        </Text>
      </ScrollView>
    </Screen>
  );
}
