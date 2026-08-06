import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Columns3, Pencil, Presentation, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryBadgeMeta, progressBadgeMeta, statusBadgeMeta } from '@/features/badges/constants/badge-catalog';
import { useToast } from '@/components/feedback/useToast';
import { RoadmapFormDialog } from '@/features/roadmap-management/components/RoadmapFormDialog';
import { useRoadmap, useRoadmapActions } from '@/features/roadmap-management/hooks/useRoadmaps';

export function ProjectPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const result = useRoadmap(id);
  const actions = useRoadmapActions();
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  if (result.isLoading) return <p className="text-sm text-muted-foreground">Carregando projeto...</p>;
  if (!result.data) {
    return (
      <section className="mx-auto max-w-4xl">
        <p className="text-destructive">Projeto nao encontrado.</p>
        <Button className="mt-4" asChild variant="outline">
          <Link to="/projects"><ArrowLeft className="h-4 w-4" />Voltar</Link>
        </Button>
      </section>
    );
  }

  const roadmap = result.data;
  const category = categoryBadgeMeta(roadmap.category);
  const status = statusBadgeMeta(roadmap.status);
  const progress = progressBadgeMeta(roadmap.progress);
  const areas: Array<{ title: string; text: string; onOpen?: () => void }> = [
    { title: 'Fases', text: 'Organize fases e edite os detalhes do planejamento.', onOpen: () => navigate(`/project/${id}/editor`) },
    { title: 'Timeline', text: 'A timeline sera construida em uma fase futura.' },
    { title: 'Tarefas', text: 'Acompanhe e organize as tarefas no quadro Kanban.', onOpen: () => navigate(`/project/${id}/kanban`) },
    { title: 'Estatisticas', text: 'As metricas detalhadas aparecerao conforme as fases forem estruturadas.', onOpen: () => setEditing(true) },
  ];

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild size="sm" variant="ghost"><Link to="/projects"><ArrowLeft className="h-4 w-4" />Projetos</Link></Button>
          <h1 className="mt-3 text-3xl font-semibold">{roadmap.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{roadmap.description || 'Sem descricao.'}</p>
          <div className="mt-3 flex flex-wrap gap-1.5"><Badge variant="status" label={status.label} icon={status.icon} color={status.color} tooltip={status.tooltip} /><Badge variant="category" label={category.label} icon={category.icon} color={category.color} tooltip={category.tooltip} /><Badge label={`v${roadmap.version}`} tooltip={`Versao ${roadmap.version}`} /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Editar projeto</Button>
          <Button asChild variant="outline"><Link to={`/project/${id}/kanban`}><Columns3 className="h-4 w-4" />Kanban</Link></Button>
          <Button asChild variant="outline"><Link to={`/project/${id}/editor`}><Rows3 className="h-4 w-4" />Fases</Link></Button>
          <Button disabled variant="outline"><Presentation className="h-4 w-4" />Apresentacao</Button>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Progresso do projeto</p>
            <p className="text-xs text-muted-foreground">Baseado nas tarefas concluidas.</p>
          </div>
          <Badge variant="progress" size="lg" label={progress.label} color={progress.color} tooltip={progress.tooltip} />
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{ width: `${roadmap.progress}%`, backgroundColor: roadmap.accentColor }}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ['Status', status.label],
          ['Versao', roadmap.version],
          ['Categoria', category.label],
          ['Atualizado', new Date(roadmap.updatedAt).toLocaleDateString('pt-BR')],
        ].map(([label, value]) => <div className="rounded-lg border bg-card p-4" key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {areas.map((area) => (
          <div className="min-h-36 rounded-lg border border-dashed p-5" key={area.title}>
            <div className="flex items-center justify-between"><h2 className="font-semibold">{area.title}</h2>{area.onOpen ? <Button type="button" variant="ghost" size="icon" aria-label={`Abrir ${area.title}`} onClick={area.onOpen}><Pencil className="h-4 w-4" /></Button> : null}</div>
            <p className="mt-3 text-sm text-muted-foreground">{area.text}</p>
          </div>
        ))}
      </div>
      <RoadmapFormDialog open={editing} roadmap={roadmap} pending={actions.update.isPending} onOpenChange={setEditing} onSubmit={(values) => actions.update.mutate({ id: roadmap.id, values }, { onSuccess: () => { setEditing(false); toast.show('Projeto atualizado.'); }, onError: () => toast.show('Nao foi possivel atualizar o projeto.', 'error') })} />
    </section>
  );
}
