import { useEffect, useState, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { isTauri } from '@tauri-apps/api/core';
import { queryClient } from '@/app/query-client';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { databaseService } from '@/database/database-service';
import { AppUpdatePrompt } from '@/components/app/AppUpdatePrompt';
import { DatabaseBootstrapService } from '@/services/database/DatabaseBootstrapService';
import { logger } from '@/services/database/Logger';
import { ToastProvider } from '@/components/feedback/Toast';

export function AppProviders({ children }: PropsWithChildren) {
  const [databaseState, setDatabaseState] = useState<'loading' | 'ready' | 'error'>(
    isTauri() ? 'loading' : 'ready',
  );

  useEffect(() => {
    if (!isTauri()) return;
    void new DatabaseBootstrapService(databaseService)
      .initialize()
      .then(() => setDatabaseState('ready'))
      .catch((error: unknown) => {
        logger.log('ERROR', 'Database bootstrap failed', { error });
        setDatabaseState('error');
      });
  }, []);

  if (databaseState === 'loading') {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Preparando banco de dados...</div>;
  }

  if (databaseState === 'error') {
    return <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-sm text-destructive">Nao foi possivel preparar o banco de dados local. Feche e abra o aplicativo novamente.</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>
          <TooltipProvider delayDuration={180}>
            {children}
            <AppUpdatePrompt />
          </TooltipProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
