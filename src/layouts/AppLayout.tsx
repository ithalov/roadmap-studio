import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app/AppSidebar';
import { AppTopbar } from '@/components/app/AppTopbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="flex min-w-0 flex-col">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
