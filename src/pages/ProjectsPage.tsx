import { useState } from 'react';
import { Grid2X2, List, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoadmapCollection } from '@/features/roadmap-management/components/RoadmapCollection';
import { RoadmapFormDialog } from '@/features/roadmap-management/components/RoadmapFormDialog';
import { useRoadmapActions, useRoadmaps } from '@/features/roadmap-management/hooks/useRoadmaps';
import type { Roadmap } from '@/database/models';
import type { RoadmapView } from '@/features/roadmap-management/types/roadmap-management';
export function ProjectsPage() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<RoadmapView>('grid');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Roadmap | null>(null);
  const result = useRoadmaps({ query });
  const actions = useRoadmapActions();
  const pending = actions.create.isPending || actions.update.isPending;
  const submit = (values: Parameters<typeof actions.create.mutate>[0]) => {
    if (editing)
      actions.update.mutate({ id: editing.id, values }, { onSuccess: () => setOpen(false) });
    else actions.create.mutate(values, { onSuccess: () => setOpen(false) });
  };
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Biblioteca local</p>
          <h1 className="text-2xl font-semibold">Projetos</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo roadmap
        </Button>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, categoria ou versão"
          />
        </div>
        <Button
          variant={view === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          aria-label="Visualização em grade"
          onClick={() => setView('grid')}
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          aria-label="Visualização em lista"
          onClick={() => setView('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{result.data?.length ?? 0} resultado(s)</p>
      {result.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando roadmaps...</p>
      ) : result.error ? (
        <p className="text-sm text-destructive">Não foi possível acessar os dados locais.</p>
      ) : result.data?.length ? (
        <RoadmapCollection
          items={result.data}
          view={view}
          onEdit={(item) => {
            setEditing(item);
            setOpen(true);
          }}
          onAction={(action, item) => {
            if (action === 'favorite') actions.favorite.mutate(item.id);
            if (action === 'duplicate') actions.duplicate.mutate(item.id);
            if (action === 'archive') actions.archive.mutate(item.id);
            if (action === 'delete') actions.softDelete.mutate(item.id);
          }}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">
            {query ? 'Nenhum projeto corresponde à busca.' : 'Sem roadmaps'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie um projeto para começar a organizar o trabalho.
          </p>
        </div>
      )}
      <RoadmapFormDialog
        open={open}
        roadmap={editing}
        pending={pending}
        onOpenChange={setOpen}
        onSubmit={submit}
      />
    </section>
  );
}
