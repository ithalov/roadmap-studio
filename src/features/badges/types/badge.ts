import type { LucideIcon } from 'lucide-react';

export const badgeVariants = [
  'neutral',
  'category',
  'status',
  'priority',
  'technology',
  'platform',
  'progress',
  'custom',
] as const;

export type BadgeVariant = (typeof badgeVariants)[number];
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeAnimation = 'none' | 'enter';

export interface BadgeMeta {
  label: string;
  icon?: LucideIcon;
  color: string;
  tooltip?: string;
}

export interface BadgePreferences {
  badgesShowIcons: boolean;
  badgesShowBorder: boolean;
  badgesShowShadow: boolean;
  badgesColored: boolean;
  badgesMinimal: boolean;
  badgesShowTooltips: boolean;
}

export const defaultBadgePreferences: BadgePreferences = {
  badgesShowIcons: true,
  badgesShowBorder: true,
  badgesShowShadow: false,
  badgesColored: true,
  badgesMinimal: false,
  badgesShowTooltips: true,
};
