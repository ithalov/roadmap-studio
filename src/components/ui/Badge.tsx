import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { defaultBadgePreferences, type BadgeAnimation, type BadgeSize, type BadgeVariant } from '@/features/badges/types/badge';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { cn } from '@/utils/cn';

const colorClasses: Record<string, string> = {
  slate: 'bg-slate-500/12 text-slate-700 dark:text-slate-300', zinc: 'bg-zinc-500/12 text-zinc-700 dark:text-zinc-300',
  blue: 'bg-blue-500/12 text-blue-700 dark:text-blue-300', sky: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  violet: 'bg-violet-500/12 text-violet-700 dark:text-violet-300', indigo: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300',
  green: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300', teal: 'bg-teal-500/12 text-teal-700 dark:text-teal-300',
  red: 'bg-red-500/12 text-red-700 dark:text-red-300', orange: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
  amber: 'bg-amber-500/12 text-amber-700 dark:text-amber-300', yellow: 'bg-yellow-500/14 text-yellow-800 dark:text-yellow-300',
  pink: 'bg-pink-500/12 text-pink-700 dark:text-pink-300', fuchsia: 'bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300',
  cyan: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300',
};

const badgeVariants = cva('inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full font-semibold leading-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', {
  variants: { size: { sm: 'min-h-5 px-2 text-[11px]', md: 'min-h-6 px-2.5 text-xs', lg: 'min-h-7 px-3 text-sm' } },
  defaultVariants: { size: 'md' },
});

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>, VariantProps<typeof badgeVariants> {
  variant?: BadgeVariant;
  label: string;
  icon?: React.ElementType;
  color?: string;
  size?: BadgeSize;
  clickable?: boolean;
  outlined?: boolean;
  minimal?: boolean;
  tooltip?: string;
  count?: number;
  animation?: BadgeAnimation;
}

function textColorFor(background: string): string {
  const hex = background.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#ffffff';
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 170 ? '#0f172a' : '#ffffff';
}

export function Badge({ variant = 'neutral', label, icon: Icon, color = 'slate', size = 'md', clickable = false, outlined, minimal, tooltip, count, animation = 'none', className, onClick, style, ...props }: BadgeProps) {
  const settings = useSettings().data;
  const preferences = settings ?? defaultBadgePreferences;
  const showIcon = preferences.badgesShowIcons && Boolean(Icon);
  const withBorder = outlined ?? preferences.badgesShowBorder;
  const isMinimal = minimal ?? preferences.badgesMinimal;
  const customColor = /^#[0-9A-Fa-f]{6}$/.test(color);
  const content = (
    <span
      className={cn(
        badgeVariants({ size }), preferences.badgesColored ? (customColor ? '' : (colorClasses[color] ?? colorClasses.slate)) : colorClasses.slate,
        withBorder && 'border border-current/15', isMinimal && 'bg-transparent',
        preferences.badgesShowShadow && 'shadow-sm', clickable && 'cursor-pointer hover:scale-[1.03] hover:shadow-sm',
        animation === 'enter' && 'animate-in fade-in-0 zoom-in-95', onClick && 'cursor-pointer', className,
      )}
      style={customColor && preferences.badgesColored ? { ...style, backgroundColor: color, color: textColorFor(color) } : style}
      {...(clickable || onClick ? { role: 'button', tabIndex: 0, onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } } } : {})}
      onClick={onClick}
      aria-label={props['aria-label'] ?? tooltip ?? label}
      data-badge-variant={variant}
      {...props}
    >
      {showIcon && Icon ? <Icon aria-hidden="true" className={size === 'lg' ? 'h-3.5 w-3.5' : 'h-3 w-3'} /> : null}
      <span>{label}</span>
      {typeof count === 'number' ? <span className="ml-0.5 tabular-nums opacity-80">{count}</span> : null}
    </span>
  );

  if (!tooltip || !preferences.badgesShowTooltips) return content;
  return <Tooltip><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent>{tooltip}</TooltipContent></Tooltip>;
}
