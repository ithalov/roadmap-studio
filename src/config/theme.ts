export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const themeModes: ThemeMode[] = ['dark', 'light', 'system'];

export const accentSwatches = [
  { name: 'Cobalt', value: '222 89% 55%' },
  { name: 'Emerald', value: '160 84% 39%' },
  { name: 'Violet', value: '262 83% 58%' },
  { name: 'Amber', value: '38 92% 50%' },
] as const;
