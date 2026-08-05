import { useEffect, useState } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { AlertTriangle, Download, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { logger } from '@/services/database/Logger';

type AvailableUpdate = NonNullable<Awaited<ReturnType<typeof check>>>;

export function AppUpdatePrompt() {
  const [update, setUpdate] = useState<AvailableUpdate | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!isTauri()) {
        return;
      }

      setChecking(true);
      try {
        const available = await check();
        if (!active || !available) {
          return;
        }

        setUpdate(available);
      } catch (error) {
        logger.log('WARN', 'Update check failed', { error });
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const install = async () => {
    if (!update) {
      return;
    }

    setDownloading(true);
    setProgress(0);
    setDownloaded(0);
    setTotal(0);
    setFailure(null);
    setMessage('Baixando atualizacao...');

    try {
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          const total = event.data.contentLength ?? 0;
          setTotal(total);
          setMessage(total ? `Baixando atualizacao... 0/${total} bytes` : 'Baixando atualizacao...');
          return;
        }

        if (event.event === 'Progress') {
          setDownloaded((current) => {
            const next = current + event.data.chunkLength;
            if (total > 0) {
              const percentage = Math.min(100, Math.round((next / total) * 100));
              setProgress(percentage);
              setMessage(`Baixando atualizacao... ${percentage}%`);
            }
            return next;
          });
          return;
        }

        if (event.event === 'Finished') {
          setProgress(100);
          setMessage('Atualizacao instalada. Reiniciando...');
        }
      });

      await relaunch();
    } catch (error) {
      logger.log('ERROR', 'Update installation failed', { error });
      setFailure(error instanceof Error ? error.message : 'Nao foi possivel atualizar o aplicativo.');
      setDownloading(false);
    }
  };

  if (!update) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
      <Card className="w-full max-w-xl border-border/80 shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Atualizacao disponivel</span>
          </div>
          <CardTitle className="text-xl">Tem uma nova versao, deseja atualizar?</CardTitle>
          <CardDescription>
            Versao atualizada: <span className="font-medium text-foreground">{update.version}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {update.body ? (
            <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
              {update.body}
            </div>
          ) : null}

          {downloading ? (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{message}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {total > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {downloaded}/{total} bytes
                </p>
              ) : null}
            </div>
          ) : null}

          {failure ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {failure}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setUpdate(null)} disabled={downloading}>
              <X className="h-4 w-4" />
              Agora nao
            </Button>
            <Button type="button" onClick={install} disabled={checking || downloading}>
              <Download className="h-4 w-4" />
              Atualizar agora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
