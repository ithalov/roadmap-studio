import * as Dialog from '@radix-ui/react-dialog';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRoadmaps } from '@/features/roadmap-management/hooks/useRoadmaps';
import { useUIStore } from '@/store/ui-store';

const shortcuts = [
  { label: 'Projetos', description: 'Abrir a biblioteca local', to: '/projects' },
  { label: 'Arquivados', description: 'Ver roadmaps arquivados', to: '/archived' },
  { label: 'Lixeira', description: 'Recuperar itens apagados', to: '/trash' },
  { label: 'Configuracoes', description: 'Ajustar tema e workspace', to: '/settings' },
  { label: 'Sobre', description: 'Informacoes do aplicativo', to: '/about' },
];

export function AppCommandPalette() {
  const open = useUIStore((state) => state.commandPaletteOpen);
  const setOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const search = query.trim();
  const roadmaps = useRoadmaps(
    search ? { query: search, sort: 'updated_desc' } : { sort: 'updated_desc' },
    open,
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-4 shadow-2xl">
          <Dialog.Title className="sr-only">Busca global</Dialog.Title>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                className="h-11 pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar projetos ou navegar"
              />
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Fechar busca">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Atalhos</p>
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <Button
                    key={shortcut.to}
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-xl border px-3 py-3 text-left"
                    onClick={() => go(shortcut.to)}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{shortcut.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {shortcut.description}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {search ? 'Resultados' : 'Projetos recentes'}
              </p>
              <div className="max-h-80 overflow-auto rounded-xl border">
                {roadmaps.isLoading ? (
                  <p className="px-4 py-8 text-sm text-muted-foreground">Carregando projetos...</p>
                ) : roadmaps.data?.length ? (
                  <div className="divide-y">
                    {roadmaps.data.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                        onClick={() => go(`/project/${item.id}`)}
                      >
                        <span
                          className="h-10 w-1 rounded-full"
                          style={{ backgroundColor: item.accentColor }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.category || 'Sem categoria'} | {item.version}
                          </span>
                        </span>
                        <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                          {item.progress}%
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-8 text-sm text-muted-foreground">
                    Nenhum projeto encontrado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
