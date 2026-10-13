import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Bookmark, Heart, MessageCircle } from 'lucide-react-native';
import { memo, useState } from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { Post } from '@/entities';
import { relativeTime } from '@/shared/lib/relative-time';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { Avatar, MediaBox, MediaDots } from '@/shared/ui';
import { useToggleBookmark, useToggleLike } from './use-feed';

interface PostCardProps {
  post: Post;
}

/** 피드 한 칸. 목록이 길어 memo 로 묶어 불필요한 리렌더를 막는다. */
export const PostCard = memo(function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();

  const iconColor = useThemeColor('content');
  const likeColor = useThemeColor('like');

  const width = Dimensions.get('window').width;

  const onLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    toggleLike.mutate(post.id);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View className="border-b border-border pb-3">
      {/* 작성자 */}
      <Pressable
        className="flex-row items-center gap-3 px-screen py-3"
        onPress={() => router.push(`/profile/${post.author.id}`)}
      >
        <Avatar seed={post.author.id} name={post.author.displayName} size="sm" />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-content">{post.author.displayName}</Text>
          <Text className="text-xs text-content-hint">
            @{post.author.handle}
            {post.locationTag ? ` · ${post.locationTag}` : ''}
          </Text>
        </View>
      </Pressable>

      {/* 미디어 */}
      {post.mediaUrls.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {post.mediaUrls.map((media) => (
              <View key={media} style={{ width }}>
                <MediaBox seed={media} />
              </View>
            ))}
          </ScrollView>
          <MediaDots items={post.mediaUrls} index={page} />
        </View>
      ) : null}

      {/* 액션 */}
      <View className="flex-row items-center gap-4 px-screen pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="좋아요"
          hitSlop={8}
          onPress={onLike}
        >
          <Heart
            size={24}
            color={post.liked ? likeColor : iconColor}
            fill={post.liked ? likeColor : 'transparent'}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="댓글"
          hitSlop={8}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <MessageCircle size={24} color={iconColor} />
        </Pressable>

        <View className="flex-1" />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="북마크"
          hitSlop={8}
          onPress={() => toggleBookmark.mutate(post.id)}
        >
          <Bookmark
            size={24}
            color={iconColor}
            fill={post.bookmarked ? iconColor : 'transparent'}
          />
        </Pressable>
      </View>

      {/* 본문 */}
      <View className="gap-1 px-screen pt-2">
        {post.likeCount > 0 ? (
          <Text className="text-sm font-semibold text-content">
            좋아요 {post.likeCount.toLocaleString('ko-KR')}개
          </Text>
        ) : null}

        <Text className="text-[15px] leading-[22px] text-content">
          {post.body}
          {post.hashtags.length > 0 ? (
            <Text className="text-brand">{post.hashtags.map((t) => `  #${t}`).join('')}</Text>
          ) : null}
        </Text>

        {post.commentCount > 0 ? (
          <Pressable onPress={() => router.push(`/post/${post.id}`)}>
            <Text className="text-sm text-content-hint">댓글 {post.commentCount}개 모두 보기</Text>
          </Pressable>
        ) : null}

        <Text className="text-xs text-content-disabled">{relativeTime(post.createdAt)} 전</Text>
      </View>
    </View>
  );
});
