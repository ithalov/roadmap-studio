import { Monitor, MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '@/app/providers/theme-context';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

const themeIcons = {
  dark: MoonStar,
  light: SunMedium,
  system: Monitor,
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = themeIcons[theme];

  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Current theme ${theme}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Switch theme</TooltipContent>
    </Tooltip>
  );
}
