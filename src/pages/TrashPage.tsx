import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PagePlaceholder } from '@/pages/PagePlaceholder';
import {
  useDeletedRoadmaps,
  useRoadmapActions,
} from '@/features/roadmap-management/hooks/useRoadmaps';
import { useToast } from '@/components/feedback/useToast';
export function TrashPage() {
  const result = useDeletedRoadmaps();
  const actions = useRoadmapActions();
  const toast = useToast();
  return (
    <PagePlaceholder
      title="Lixeira"
      description="Roadmaps excluídos permanecem disponíveis para restauração."
    >
      {result.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando lixeira...</p>
      ) : result.data?.length ? (
        <div className="divide-y rounded-lg border bg-card">
          {result.data.map((item) => (
            <div className="flex items-center justify-between gap-4 p-4" key={item.id}>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  Excluído em {new Date(item.deletedAt ?? '').toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={actions.restoreDeleted.isPending}
                  onClick={() =>
                    actions.restoreDeleted.mutate(item.id, {
                      onSuccess: () => toast.show('Projeto restaurado.'),
                      onError: () => toast.show('Nao foi possivel restaurar o projeto.', 'error'),
                    })
                  }
                >
                  Restaurar
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="Excluir permanentemente"
                  disabled={actions.permanentDelete.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Excluir permanentemente este roadmap e seus dados relacionados?',
                      )
                    )
                      actions.permanentDelete.mutate(item.id, {
                        onSuccess: () => toast.show('Projeto excluido permanentemente.'),
                        onError: () => toast.show('Nao foi possivel excluir o projeto.', 'error'),
                      });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">A lixeira está vazia.</p>
      )}
    </PagePlaceholder>
  );
}
