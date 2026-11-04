import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { places } from '@/data/fake/dummy-data';
import { useDraft } from '@/features/write/draft-store';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { EmptyState, Screen } from '@/shared/ui';

/** 3단계 보조 — 위치 태그 선택. 고르면 본문 화면으로 되돌아간다. */
export default function WriteLocationScreen() {
  const router = useRouter();
  const locationTag = useDraft((s) => s.locationTag);
  const setLocation = useDraft((s) => s.setLocation);
  const [query, setQuery] = useState('');

  const iconColor = useThemeColor('content');
  const hintColor = useThemeColor('content-hint');
  const brand = useThemeColor('brand');

  const q = query.trim();
  const filtered = q ? places.filter((p) => p.includes(q)) : places;

  const pick = (place: string | null) => {
    setLocation(place);
    router.back();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View className="h-14 flex-row items-center gap-1 px-screen">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
          onPress={() => router.back()}
          className="-ml-2 h-10 w-10 items-center justify-center"
        >
          <ChevronLeft size={26} color={iconColor} />
        </Pressable>
        <Text className="text-lg font-bold text-content">위치</Text>
      </View>

      <View className="px-screen pb-2">
        <View className="h-10 flex-row items-center gap-2 rounded-lg bg-surface px-3">
          <Search size={18} color={hintColor} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="장소 검색"
            placeholderTextColor={hintColor}
            autoCorrect={false}
            className="flex-1 text-[15px] text-content"
          />
          {q ? (
            <Pressable accessibilityLabel="지우기" hitSlop={8} onPress={() => setQuery('')}>
              <X size={18} color={hintColor} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* 이미 고른 위치가 있으면 해제 경로를 준다 */}
      {locationTag ? (
        <Pressable className="px-screen py-3" onPress={() => pick(null)}>
          <Text className="text-sm font-semibold text-brand">위치 태그 제거</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(place) => place}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState title="검색 결과가 없습니다" description={`"${q}"`} />}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row items-center gap-3 px-screen py-3.5"
            onPress={() => pick(item)}
          >
            <MapPin size={18} color={item === locationTag ? brand : hintColor} />
            <Text
              className={
                item === locationTag
                  ? 'text-[15px] font-semibold text-brand'
                  : 'text-[15px] text-content'
              }
            >
              {item}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
