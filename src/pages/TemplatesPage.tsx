import { useRef, useState } from 'react';
import { FileUp, LayoutTemplate } from 'lucide-react';
import type { RoadmapTemplate } from '@/database/models';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/feedback/useToast';
import { TemplateDetails } from '@/features/templates/components/TemplateDetails';
import { TemplateFilters } from '@/features/templates/components/TemplateFilters';
import { TemplateGallery } from '@/features/templates/components/TemplateGallery';
import { TemplateProjectDialog } from '@/features/templates/components/TemplateProjectDialog';
import { useTemplateActions, useTemplates } from '@/features/templates/hooks/useTemplates';
import { templateService } from '@/features/templates/services/TemplateService';
import type { TemplateFilters as TemplateFiltersValue } from '@/features/templates/types/template';

export function TemplatesPage() {
  const [filters, setFilters] = useState<TemplateFiltersValue>({ sort: 'recent' });
  const [selected, setSelected] = useState<RoadmapTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const result = useTemplates(filters);
  const actions = useTemplateActions();
  const toast = useToast();
  const exportTemplate = async () => {
    if (!selected) return;
    const data = await templateService.export(selected.id);
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selected.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'template'}.rstemplate`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutTemplate className="h-4 w-4" />
            Biblioteca local
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reutilize estruturas de projetos sem alterar o original.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={input}
            className="hidden"
            type="file"
            accept="application/json,.rstemplate"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              file.text().then((content) =>
                actions.import.mutate(JSON.parse(content), {
                  onSuccess: (item) => {
                    setSelected(item);
                    toast.show('Template importado.');
                  },
                  onError: () => toast.show('Arquivo de template inválido.', 'error'),
                }),
              );
              event.target.value = '';
            }}
          />
          <Button variant="outline" onClick={() => input.current?.click()}>
            <FileUp className="h-4 w-4" />
            Importar
          </Button>
        </div>
      </header>
      <TemplateFilters filters={filters} onChange={setFilters} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {result.isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Carregando templates...
            </p>
          ) : result.error ? (
            <p className="text-destructive">Não foi possível carregar os templates.</p>
          ) : (
            <TemplateGallery
              items={result.data ?? []}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          )}
        </div>
        {selected ? (
          <TemplateDetails
            item={selected}
            onClose={() => setSelected(null)}
            onUse={() => setCreateOpen(true)}
            onFavorite={() =>
              actions.favorite.mutate(selected.id, {
                onSuccess: () => toast.show('Favorito atualizado.'),
              })
            }
            onExport={() => {
              void exportTemplate();
            }}
            onDelete={() =>
              actions.remove.mutate(selected.id, {
                onSuccess: () => {
                  setSelected(null);
                  toast.show('Template movido para a lixeira.');
                },
              })
            }
          />
        ) : (
          <aside className="hidden rounded-lg border border-dashed p-6 text-sm text-muted-foreground lg:block">
            Selecione um template para ver os detalhes, exportar ou criar um novo projeto.
          </aside>
        )}
      </div>
      <TemplateProjectDialog
        item={selected}
        open={createOpen}
        pending={actions.use.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={(values) =>
          selected &&
          actions.use.mutate(
            { id: selected.id, values },
            {
              onSuccess: (roadmap) => {
                setCreateOpen(false);
                toast.show('Projeto criado com o template.');
                window.location.hash = `#/project/${roadmap.id}`;
              },
              onError: () => toast.show('Não foi possível criar o projeto.', 'error'),
            },
          )
        }
      />
    </section>
  );
}
