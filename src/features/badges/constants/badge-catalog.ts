import {
  Archive,
  Bot,
  Box,
  BriefcaseBusiness,
  CirclePause,
  CirclePlay,
  CircleStop,
  Code2,
  Database,
  Gamepad2,
  Gem,
  GraduationCap,
  Layers3,
  Lightbulb,
  MonitorSmartphone,
  Package,
  Palette,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  TerminalSquare,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeMeta } from '@/features/badges/types/badge';

const normalize = (value: string) => value.trim().toLocaleLowerCase('pt-BR');

const categoryEntries: Record<string, BadgeMeta> = {
  game: { label: 'Game', icon: Gamepad2, color: 'violet', tooltip: 'Projeto de jogo' },
  jogo: { label: 'Game', icon: Gamepad2, color: 'violet', tooltip: 'Projeto de jogo' },
  software: { label: 'Software', icon: Code2, color: 'blue', tooltip: 'Projeto de software' },
  web: { label: 'Web', icon: MonitorSmartphone, color: 'sky', tooltip: 'Projeto web' },
  mobile: { label: 'Mobile', icon: Smartphone, color: 'teal', tooltip: 'Aplicativo mobile' },
  minecraft: { label: 'Minecraft', icon: Gem, color: 'green', tooltip: 'Projeto Minecraft' },
  ia: { label: 'IA', icon: Bot, color: 'pink', tooltip: 'Inteligencia artificial' },
  'discord bot': { label: 'Discord Bot', icon: Bot, color: 'indigo', tooltip: 'Bot para Discord' },
  backend: { label: 'Backend', icon: Server, color: 'slate', tooltip: 'Servicos de backend' },
  database: { label: 'Database', icon: Database, color: 'amber', tooltip: 'Banco de dados' },
  'ui/ux': { label: 'UI/UX', icon: Palette, color: 'orange', tooltip: 'Interface e experiencia' },
  faculdade: { label: 'Faculdade', icon: GraduationCap, color: 'cyan', tooltip: 'Projeto academico' },
  api: { label: 'API', icon: Package, color: 'red', tooltip: 'Interface de programacao' },
  ferramenta: { label: 'Ferramenta', icon: Wrench, color: 'zinc', tooltip: 'Ferramenta interna' },
  startup: { label: 'Startup', icon: Rocket, color: 'fuchsia', tooltip: 'Produto de startup' },
  business: { label: 'Business', icon: BriefcaseBusiness, color: 'emerald', tooltip: 'Projeto de negocio' },
  experimental: { label: 'Experimental', icon: Lightbulb, color: 'yellow', tooltip: 'Experimento' },
};

export function categoryBadgeMeta(category: string): BadgeMeta {
  const fallback = category.trim() || 'Sem categoria';
  return categoryEntries[normalize(category)] ?? {
    label: fallback,
    icon: Layers3,
    color: 'slate',
    tooltip: `Categoria: ${fallback}`,
  };
}

const statusEntries: Record<string, BadgeMeta> = {
  active: { label: 'Ativo', icon: CirclePlay, color: 'green', tooltip: 'Projeto ativo' },
  planned: { label: 'Planejamento', icon: CirclePlay, color: 'yellow', tooltip: 'Em planejamento' },
  in_progress: { label: 'Em desenvolvimento', icon: CirclePlay, color: 'blue', tooltip: 'Em desenvolvimento' },
  beta: { label: 'Beta', icon: Sparkles, color: 'violet', tooltip: 'Em fase beta' },
  archived: { label: 'Arquivado', icon: Archive, color: 'slate', tooltip: 'Projeto arquivado' },
  paused: { label: 'Pausado', icon: CirclePause, color: 'red', tooltip: 'Projeto pausado' },
  completed: { label: 'Concluido', icon: CirclePlay, color: 'green', tooltip: 'Projeto concluido' },
  draft: { label: 'Rascunho', icon: TerminalSquare, color: 'orange', tooltip: 'Ainda em rascunho' },
  blocked: { label: 'Bloqueado', icon: CircleStop, color: 'red', tooltip: 'Aguardando desbloqueio' },
  backlog: { label: 'Backlog', icon: Box, color: 'slate', tooltip: 'Aguardando planejamento' },
  not_started: { label: 'Nao iniciada', icon: CirclePlay, color: 'zinc', tooltip: 'Tarefa nao iniciada' },
  in_review: { label: 'Em revisao', icon: Sparkles, color: 'violet', tooltip: 'Aguardando revisao' },
  cancelled: { label: 'Cancelado', icon: CircleStop, color: 'slate', tooltip: 'Item cancelado' },
};

export function statusBadgeMeta(status: string): BadgeMeta {
  const fallback = status.trim() || 'Sem status';
  return statusEntries[normalize(status)] ?? { label: fallback, color: 'slate', tooltip: `Status: ${fallback}` };
}

const priorityEntries: Record<string, BadgeMeta> = {
  critical: { label: 'Critica', color: 'red', tooltip: 'Prioridade critica' },
  high: { label: 'Alta', color: 'orange', tooltip: 'Prioridade alta' },
  medium: { label: 'Media', color: 'yellow', tooltip: 'Prioridade media' },
  low: { label: 'Baixa', color: 'green', tooltip: 'Prioridade baixa' },
  optional: { label: 'Opcional', color: 'slate', tooltip: 'Prioridade opcional' },
};

export function priorityBadgeMeta(priority: string): BadgeMeta {
  const fallback = priority.trim() || 'Sem prioridade';
  return priorityEntries[normalize(priority)] ?? { label: fallback, color: 'slate', tooltip: `Prioridade: ${fallback}` };
}

const technologyIcons: Record<string, LucideIcon> = {
  react: Code2, vue: Code2, angular: Code2, java: Code2, kotlin: Code2, rust: Code2, 'c#': Code2,
  typescript: Code2, 'node.js': Server, spring: Server, forge: Wrench, fabric: Wrench, neoforge: Wrench,
  electron: MonitorSmartphone, tauri: MonitorSmartphone, flutter: Smartphone, supabase: Database,
  sqlite: Database, postgresql: Database, mysql: Database, mongodb: Database, docker: Box, github: Package,
};

export function technologyBadgeMeta(technology: string): BadgeMeta {
  const fallback = technology.trim() || 'Tecnologia';
  return { label: fallback, icon: technologyIcons[normalize(technology)] ?? Code2, color: 'slate', tooltip: fallback };
}

export function progressBadgeMeta(progress: number): BadgeMeta {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  const color = value === 100 ? 'green' : value >= 75 ? 'blue' : value >= 40 ? 'yellow' : 'slate';
  return { label: `${value}%`, color, tooltip: `${value}% concluido` };
}
