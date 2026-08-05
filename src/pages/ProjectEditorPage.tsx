import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link, useParams } from 'react-router-dom';
import { GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Phase } from '@/database/models';
import { PhasePanel } from '@/features/phases/components/PhasePanel';
import { usePhaseActions, usePhases } from '@/features/phases/hooks/usePhases';
import { useDeletedPhases } from '@/features/phases/hooks/usePhases';
import { useToast } from '@/components/feedback/useToast';
import { phaseStatusLabels } from '@/features/phases/types/phase';
import { TaskList } from '@/features/tasks/components/TaskList';
function Row({ phase, open, remove }: { phase: Phase; open(): void; remove(): void }) {
  const sort = useSortable({ id: phase.id });
  return (
    <article
      ref={sort.setNodeRef}
      style={{ transform: CSS.Transform.toString(sort.transform), transition: sort.transition }}
      className="flex items-center gap-3 rounded-lg border bg-card p-4"
    >
      <button
        className="cursor-grab"
        aria-label="Arrastar fase"
        {...sort.attributes}
        {...sort.listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-xs">{phase.position + 1}</span>
      <button className="min-w-0 flex-1 text-left" onClick={open}>
        <b>{phase.title}</b>
        <p className="truncate text-sm text-muted-foreground">
          {phase.description || 'Sem descrição'}
        </p>
      </button>
      <span>{phase.progress}%</span>
      <Button size="icon" variant="ghost" aria-label="Excluir fase" onClick={remove}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </article>
  );
}
export function ProjectEditorPage() {
  const { id = '' } = useParams<{ id: string }>();
  const query = usePhases(id);
  const actions = usePhaseActions(id);
  const deleted = useDeletedPhases(id);
  const toast = useToast();
  const [optimistic, setOptimistic] = useState<Phase[] | null>(null);
  const [selected, setSelected] = useState<Phase | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [focus, setFocus] = useState(false);
  const items = optimistic ?? query.data ?? [];
  const visible = items.filter(
    (p) =>
      (!search || `${p.title} ${p.description}`.toLowerCase().includes(search.toLowerCase())) &&
      (!status || p.status === status),
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const reorder = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((p) => p.id === active.id);
    const to = items.findIndex((p) => p.id === over.id);
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    setOptimistic(next);
    actions.reorder.mutate(
      next.map((p) => p.id),
      { onSettled: () => setOptimistic(null) },
    );
  };
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <header className="flex justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link to={`/project/${id}`}>Voltar ao projeto</Link>
          </Button>
          <h1 className="mt-2 text-2xl font-semibold">Editor de fases</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setFocus(!focus)}>
            {focus ? 'Sair do foco' : 'Modo foco'}
          </Button>
          <Button
            onClick={() =>
              actions.create.mutate({
                title: 'Nova fase',
                description: '',
                status: 'planned',
                priority: 'medium',
                progress: 0,
                progressMode: 'manual',
                startDate: null,
                targetDate: null,
                color: null,
                icon: null,
              }, { onSuccess: () => toast.show('Fase criada.'), onError: () => toast.show('Não foi possível criar a fase.', 'error') })
            }
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </header>
      {!focus && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fases"
            />
          </div>
          <select
            className="rounded-lg border bg-background px-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(phaseStatusLabels).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      {query.isLoading ? (
        <p>Carregando fases...</p>
      ) : !visible.length ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Este roadmap ainda não possui fases compatíveis.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
          <SortableContext items={visible.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {visible.map((phase) => (
                <Row
                  key={phase.id}
                  phase={phase}
                  open={() => setSelected(phase)}
                  remove={() => actions.remove.mutate(phase.id, { onSuccess: () => toast.show('Fase movida para a lixeira.'), onError: () => toast.show('Não foi possível excluir a fase.', 'error') })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <PhasePanel
        phase={selected}
        saving={actions.update.isPending}
        onClose={() => setSelected(null)}
        onSave={(values) =>
          selected &&
          actions.update.mutate({ id: selected.id, values }, { onSuccess: () => setSelected(null) })
        }
      />
      {selected ? <TaskList phase={selected} phases={items} /> : null}
      {deleted.data?.length ? <section className="rounded-lg border p-4"><h2 className="font-semibold">Fases excluídas</h2><div className="mt-3 space-y-2">{deleted.data.map((phase) => <div key={phase.id} className="flex items-center justify-between text-sm"><span>{phase.title}</span><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => actions.restore.mutate(phase.id, { onSuccess: () => toast.show('Fase restaurada.') })}>Restaurar</Button><Button size="sm" variant="destructive" onClick={() => actions.permanentDelete.mutate(phase.id, { onSuccess: () => toast.show('Fase excluída permanentemente.') })}>Excluir</Button></div></div>)}</div></section> : null}
    </section>
  );
}
