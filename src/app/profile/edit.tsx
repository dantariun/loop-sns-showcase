import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMe, useUpdateMe } from '@/features/profile/use-users';
import { cn } from '@/shared/lib/cn';
import { useThemeColor } from '@/shared/lib/use-theme-color';
import { AppBar, Avatar, LoadingState, Screen } from '@/shared/ui';

const MAX_NAME = 20;
const MAX_HANDLE = 20;
const MAX_BIO = 150;

/** 아이디 규칙 — 영문 소문자·숫자·밑줄·마침표 */
const HANDLE_RULE = /^[a-z0-9._]+$/;

/**
 * 내 프로필 편집.
 *
 * 저장은 서버가 확정한 뒤에만 반영한다 — 아이디 중복으로 거절될 수 있어
 * 낙관적으로 먼저 바꿔두면 되돌리는 쪽이 더 번거롭다.
 */
export default function ProfileEditScreen() {
  const router = useRouter();
  const { data: me, isPending } = useMe();
  const updateMe = useUpdateMe();

  const hintColor = useThemeColor('content-hint');

  // 서버 값이 도착한 뒤 한 번만 초기화한다
  const [form, setForm] = useState<{ handle: string; displayName: string; bio: string } | null>(
    null,
  );
  const value =
    form ?? (me ? { handle: me.handle, displayName: me.displayName, bio: me.bio } : null);

  if (isPending || !value) {
    return (
      <Screen>
        <AppBar showBack title="프로필 편집" />
        <LoadingState />
      </Screen>
    );
  }

  const patch = (next: Partial<typeof value>) => setForm({ ...value, ...next });

  const nameError = value.displayName.trim().length === 0 ? '이름을 입력해 주세요' : null;
  const handleError =
    value.handle.trim().length < 2
      ? '아이디는 2자 이상이어야 합니다'
      : HANDLE_RULE.test(value.handle.trim())
        ? null
        : '영문 소문자·숫자·밑줄·마침표만 쓸 수 있습니다';

  const dirty =
    me !== undefined &&
    (value.handle !== me.handle || value.displayName !== me.displayName || value.bio !== me.bio);

  const canSave = dirty && !nameError && !handleError && !updateMe.isPending;

  const save = () => {
    if (!canSave) return;
    updateMe.mutate(
      { handle: value.handle.trim(), displayName: value.displayName.trim(), bio: value.bio },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <AppBar
        showBack
        title="프로필 편집"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="저장"
            disabled={!canSave}
            onPress={save}
          >
            {updateMe.isPending ? (
              <ActivityIndicator size="small" color={hintColor} />
            ) : (
              <Text
                className={cn(
                  'text-[15px] font-semibold',
                  canSave ? 'text-brand' : 'text-content-disabled',
                )}
              >
                저장
              </Text>
            )}
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* 아바타 — 더미 단계라 시드로 색만 정해진다 */}
          <View className="items-center py-6">
            <Avatar seed={me?.id ?? 'me'} name={value.displayName} size="lg" />
            <Text className="mt-3 text-sm font-semibold text-content-disabled">
              사진 변경 (준비 중)
            </Text>
          </View>

          <Field
            label="이름"
            value={value.displayName}
            onChangeText={(t) => patch({ displayName: t.slice(0, MAX_NAME) })}
            placeholder="표시될 이름"
            counter={`${value.displayName.length} / ${MAX_NAME}`}
            error={nameError}
          />

          <Field
            label="아이디"
            value={value.handle}
            onChangeText={(t) => patch({ handle: t.slice(0, MAX_HANDLE).toLowerCase() })}
            placeholder="영문 소문자·숫자"
            prefix="@"
            autoCapitalize="none"
            counter={`${value.handle.length} / ${MAX_HANDLE}`}
            error={handleError}
          />

          <Field
            label="소개"
            value={value.bio}
            onChangeText={(t) => patch({ bio: t.slice(0, MAX_BIO) })}
            placeholder="나를 한 줄로 소개해 보세요"
            multiline
            counter={`${value.bio.length} / ${MAX_BIO}`}
          />

          {/* 서버가 거절한 경우 — 아이디 중복 등 */}
          {updateMe.isError ? (
            <Text className="px-screen pt-2 text-xs font-medium text-like">
              {updateMe.error instanceof Error ? updateMe.error.message : '저장하지 못했습니다'}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  counter: string;
  prefix?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  error?: string | null;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  counter,
  prefix,
  multiline = false,
  autoCapitalize = 'sentences',
  error = null,
}: FieldProps) {
  const hintColor = useThemeColor('content-hint');

  return (
    <View className="border-b border-border px-screen py-3">
      <Text className="text-xs font-bold uppercase text-content-hint">{label}</Text>

      <View className="flex-row items-start">
        {prefix ? <Text className="pt-2 text-[15px] text-content-hint">{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={hintColor}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          className={cn(
            'flex-1 pt-1.5 text-[15px] leading-[22px] text-content',
            multiline && 'min-h-20',
          )}
        />
      </View>

      <View className="flex-row items-center justify-between pt-1">
        <Text className="text-[11px] font-medium text-like">{error ?? ''}</Text>
        <Text className="text-[11px] text-content-disabled">{counter}</Text>
      </View>
    </View>
  );
}
