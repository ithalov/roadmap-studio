import { Outlet } from 'react-router-dom';
import { AppCommandPalette } from '@/components/app/AppCommandPalette';
import { AppSidebar } from '@/components/app/AppSidebar';
import { AppTopbar } from '@/components/app/AppTopbar';
import { Wallpaper } from '@/components/wallpaper/Wallpaper';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { defaultSettingsFormValues } from '@/features/settings/schemas/settings-form';

export function AppLayout() {
  const settings = useSettings();
  const wallpaper = settings.data ?? defaultSettingsFormValues;

  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      <Wallpaper style={wallpaper.wallpaper} intensity={wallpaper.wallpaperIntensity} />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="flex min-w-0 flex-col">
          <AppTopbar />
          <AppCommandPalette />
          <main className="relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
