import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Columns3, Pencil, Presentation, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRoadmap } from '@/features/roadmap-management/hooks/useRoadmaps';
import { roadmapStatusLabels } from '@/features/roadmap-management/types/roadmap-management';
export function ProjectPage() {
  const { id = '' } = useParams<{ id: string }>();
  const result = useRoadmap(id);
  if (result.isLoading)
    return <p className="text-sm text-muted-foreground">Carregando projeto...</p>;
  if (!result.data)
    return (
      <section className="mx-auto max-w-4xl">
        <p className="text-destructive">Projeto não encontrado.</p>
        <Button className="mt-4" asChild variant="outline">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </section>
    );
  const roadmap = result.data;
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild size="sm" variant="ghost">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
              Projetos
            </Link>
          </Button>
          <h1 className="mt-3 text-3xl font-semibold">{roadmap.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {roadmap.description || 'Sem descrição.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/project/${id}/kanban`}>
              <Columns3 className="h-4 w-4" />
              Kanban
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/project/${id}/editor`}>
              <Rows3 className="h-4 w-4" />
              Fases
            </Link>
          </Button>
          <Button disabled variant="outline">
            <Presentation className="h-4 w-4" />
            Apresentação
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          [
            'Status',
            roadmapStatusLabels[roadmap.status as keyof typeof roadmapStatusLabels] ??
              roadmap.status,
          ],
          ['Versão', roadmap.version],
          ['Categoria', roadmap.category || 'Sem categoria'],
          ['Atualizado', new Date(roadmap.updatedAt).toLocaleDateString('pt-BR')],
        ].map(([label, value]) => (
          <div className="rounded-lg border bg-card p-4" key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['Fases', 'O editor de fases estará disponível nesta área.'],
          ['Timeline', 'A timeline será construída em uma fase futura.'],
          ['Tarefas', 'As tarefas serão conectadas ao editor de fases.'],
          [
            'Estatísticas',
            'As métricas detalhadas aparecerão conforme as fases forem estruturadas.',
          ],
        ].map(([title, text]) => (
          <div className="min-h-36 rounded-lg border border-dashed p-5" key={title}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{title}</h2>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
