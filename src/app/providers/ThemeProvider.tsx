import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { useSystemTheme } from '@/hooks/use-system-theme';
import { useThemeStore } from '@/store/theme-store';
import type { ResolvedTheme } from '@/config/theme';
import { ThemeContext } from '@/app/providers/theme-context';

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const systemTheme = useSystemTheme();
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
