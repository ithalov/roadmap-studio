import { Link } from 'react-router-dom';
import { FolderKanban, ListTodo, Plus, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RoadmapCollection } from '@/features/roadmap-management/components/RoadmapCollection';
import {
  useDashboardData,
  useRoadmapActions,
} from '@/features/roadmap-management/hooks/useRoadmaps';

export function DashboardPage() {
  const dashboard = useDashboardData();
  const actions = useRoadmapActions();
  const stats = dashboard.data?.stats;
  const cards = [
    { label: 'Projetos', value: stats?.totalRoadmaps, icon: FolderKanban },
    { label: 'Em andamento', value: stats?.activeRoadmaps, icon: TimerReset },
    { label: 'Tarefas pendentes', value: stats?.pendingTasks, icon: ListTodo },
  ];
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Visão geral local</p>
          <h1 className="text-2xl font-semibold">Seus roadmaps</h1>
        </div>
        <Button asChild>
          <Link to="/projects">
            <Plus className="h-4 w-4" />
            Novo roadmap
          </Link>
        </Button>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div className="rounded-lg border bg-card p-4" key={label}>
            <Icon className="mb-3 h-4 w-4 text-muted-foreground" />
            <p className="text-2xl font-semibold">{dashboard.isLoading ? '-' : (value ?? 0)}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Atualizados recentemente</h2>
        <Link className="text-sm text-primary hover:underline" to="/projects">
          Ver todos
        </Link>
      </div>
      {dashboard.error ? (
        <p className="text-sm text-destructive">
          Banco indisponível. Tente reiniciar o aplicativo.
        </p>
      ) : dashboard.data?.recent.length ? (
        <RoadmapCollection
          items={dashboard.data.recent}
          view="grid"
          onEdit={() => undefined}
          onAction={(action, item) => {
            if (action === 'favorite') actions.favorite.mutate(item.id);
            if (action === 'duplicate') actions.duplicate.mutate(item.id);
            if (action === 'archive') actions.archive.mutate(item.id);
            if (action === 'delete') actions.softDelete.mutate(item.id);
          }}
        />
      ) : (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Seu primeiro roadmap começa aqui. Crie um projeto para organizar objetivos e fases.
        </p>
      )}
    </section>
  );
}
