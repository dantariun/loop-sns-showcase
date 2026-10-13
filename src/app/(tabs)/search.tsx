import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { UserRow } from '@/features/profile/user-row';
import {
  useExplore,
  usePostSearch,
  useSuggestedUsers,
  useTrendingTags,
  useUserSearch,
} from '@/features/search/use-search';
import { relativeTime } from '@/shared/lib/relative-time';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { EmptyState, LoadingState, MediaBox, Screen } from '@/shared/ui';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;

  const hintColor = useThemeColor('content-hint');

  const { data: tags = [] } = useTrendingTags();
  const { data: suggested = [] } = useSuggestedUsers();
  const { data: explore = [], isPending } = useExplore();
  const { data: foundUsers = [] } = useUserSearch(query);
  const { data: foundPosts = [] } = usePostSearch(query);

  return (
    <Screen>
      {/* 검색 입력 */}
      <View className="px-screen py-2">
        <View className="h-10 flex-row items-center gap-2 rounded-lg bg-surface px-3">
          <SearchIcon size={18} color={hintColor} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="사용자 · 게시물 · 태그 검색"
            placeholderTextColor={hintColor}
            returnKeyType="search"
            autoCorrect={false}
            className="flex-1 text-[15px] text-content"
          />
          {searching ? (
            <Pressable accessibilityLabel="지우기" hitSlop={8} onPress={() => setQuery('')}>
              <X size={18} color={hintColor} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {searching ? (
        <FlatList
          data={foundUsers}
          keyExtractor={(user) => user.id}
          renderItem={({ item }) => <UserRow user={item} />}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={foundUsers.length > 0 ? <SectionTitle>사용자</SectionTitle> : null}
          ListFooterComponent={
            <View>
              {foundPosts.length > 0 ? <SectionTitle>게시물</SectionTitle> : null}
              {foundPosts.map((post) => (
                <Pressable
                  key={post.id}
                  className="flex-row items-center gap-3 px-screen py-2.5"
                  onPress={() => router.push(`/post/${post.id}`)}
                >
                  <View className="h-12 w-12 overflow-hidden rounded-lg">
                    <MediaBox seed={post.mediaUrls[0] ?? post.id} />
                  </View>
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-sm text-content">
                      {post.body}
                    </Text>
                    <Text className="text-xs text-content-hint">
                      @{post.author.handle} · {relativeTime(post.createdAt)} 전
                    </Text>
                  </View>
                </Pressable>
              ))}

              {foundUsers.length === 0 && foundPosts.length === 0 ? (
                <EmptyState title="검색 결과가 없습니다" description={`"${query.trim()}"`} />
              ) : null}
            </View>
          }
        />
      ) : isPending ? (
        <LoadingState />
      ) : (
        <FlashList
          data={explore}
          numColumns={3}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <Pressable className="flex-1 p-px" onPress={() => router.push(`/post/${item.id}`)}>
              <MediaBox seed={item.mediaUrls[0] ?? item.id} />
            </Pressable>
          )}
          ListHeaderComponent={
            <View>
              {/* 인기 태그 */}
              <SectionTitle>인기 태그</SectionTitle>
              <View className="flex-row flex-wrap gap-2 px-screen pb-3">
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => setQuery(tag)}
                    className="rounded-full bg-brand/10 px-3 py-1.5"
                  >
                    <Text className="text-sm font-medium text-brand">#{tag}</Text>
                  </Pressable>
                ))}
              </View>

              {/* 추천 사용자 */}
              {suggested.length > 0 ? (
                <>
                  <SectionTitle>추천</SectionTitle>
                  {suggested.slice(0, 3).map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </>
              ) : null}

              <SectionTitle>둘러보기</SectionTitle>
            </View>
          }
        />
      )}
    </Screen>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="px-screen pb-2 pt-4 text-sm font-bold text-content">{children}</Text>;
}
