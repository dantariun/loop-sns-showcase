/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      // 색은 src/global.css 의 CSS 변수를 가리킨다 — 단일 출처.
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          soft: 'rgb(var(--color-brand-soft) / <alpha-value>)',
        },
        like: 'rgb(var(--color-like) / <alpha-value>)',
        badge: 'rgb(var(--color-badge) / <alpha-value>)',

        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',

        content: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          hint: 'rgb(var(--color-text-hint) / <alpha-value>)',
          disabled: 'rgb(var(--color-text-disabled) / <alpha-value>)',
        },

        bubble: 'rgb(var(--color-bubble-peer) / <alpha-value>)',
      },
      // Compose 쪽 Dimens 를 그대로 옮긴 치수
      spacing: {
        screen: '16px',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
