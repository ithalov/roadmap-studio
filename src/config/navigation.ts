import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  CircleGauge,
  FolderKanban,
  Info,
  LayoutTemplate,
  Settings2,
  Trash2,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'Visão geral', to: '/', icon: CircleGauge },
  { label: 'Projetos', to: '/projects', icon: FolderKanban },
  { label: 'Templates', to: '/templates', icon: LayoutTemplate },
  { label: 'Arquivados', to: '/archived', icon: Archive },
  { label: 'Lixeira', to: '/trash', icon: Trash2 },
  { label: 'Configurações', to: '/settings', icon: Settings2 },
  { label: 'Sobre', to: '/about', icon: Info },
];
