import { useCallback, useEffect, useState } from 'react';
import type { DashboardModule } from '@/features/dashboard/types/dashboard';

const storageKey = 'roadmap-studio.dashboard-hidden-modules';
const allModules: DashboardModule[] = ['stats', 'progress', 'activity', 'recent', 'favorites', 'tasks', 'productivity', 'goals', 'actions'];

export function useDashboardModules() {
  const [hidden, setHidden] = useState<DashboardModule[]>(() => {
    try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); return Array.isArray(value) ? value.filter((item): item is DashboardModule => typeof item === 'string' && allModules.includes(item as DashboardModule)) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(hidden)); }, [hidden]);
  const toggle = useCallback((module: DashboardModule) => setHidden((current) => current.includes(module) ? current.filter((item) => item !== module) : [...current, module]), []);
  return { hidden, toggle, visible: (module: DashboardModule) => !hidden.includes(module) };
}
