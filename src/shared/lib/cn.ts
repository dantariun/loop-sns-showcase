import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 조건부 className 합성 + 충돌 해소.
 *
 * 컴포넌트가 기본 클래스를 들고 있고 호출부가 `className` 으로 덮어쓰는 패턴에서,
 * `p-4` 와 `p-2` 가 동시에 남는 사고를 막는다 — 뒤에 온 쪽이 이긴다.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
