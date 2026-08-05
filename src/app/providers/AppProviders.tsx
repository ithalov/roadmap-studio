import { useEffect, type PropsWithChildren } from 'react';
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
  useEffect(() => {
    if (!isTauri()) return;
    void new DatabaseBootstrapService(databaseService).initialize().catch((error: unknown) => {
      logger.log('ERROR', 'Database bootstrap failed', { error });
    });
  }, []);

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
