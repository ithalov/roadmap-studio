import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { primaryNavigation } from '@/config/navigation';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { BrandMark } from '@/components/app/BrandMark';
import { useTranslation } from '@/i18n/useTranslation';

export function AppSidebar() {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { t } = useTranslation();
  const labels = [t('overview'), t('projects'), t('archived'), t('trash'), t('settings'), t('about')];

  return (
    <aside
      className={cn(
        'hidden border-r border-border bg-card/80 backdrop-blur-xl lg:flex lg:flex-col',
        collapsed ? 'lg:w-[80px]' : 'lg:w-[280px]',
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-4', collapsed && 'justify-center px-3')}>
        <BrandMark compact={collapsed} />
      </div>

      <Separator />

      <nav className={cn('flex flex-1 flex-col gap-1 px-3 py-4', collapsed && 'items-center px-2')}>
        {primaryNavigation.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                  collapsed && 'w-11 justify-center px-0',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {!collapsed ? (
                <span>{labels[index]}</span>
              ) : (
                <span className="sr-only">{labels[index]}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Separator />

      <div
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-3',
          collapsed && 'justify-center',
        )}
      >
        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t('foundation')}
            </p>
            <p className="text-xs text-muted-foreground">{t('phase')}</p>
          </div>
        ) : null}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
