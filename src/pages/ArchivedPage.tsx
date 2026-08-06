import { useState } from 'react';
import { ArchiveRestore, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PagePlaceholder } from '@/pages/PagePlaceholder';
import { RoadmapCollection } from '@/features/roadmap-management/components/RoadmapCollection';
import {
  useArchivedRoadmaps,
  useRoadmapActions,
} from '@/features/roadmap-management/hooks/useRoadmaps';
import { useTranslation } from '@/i18n/useTranslation';
export function ArchivedPage() {
  const [query, setQuery] = useState('');
  const result = useArchivedRoadmaps({ query });
  const actions = useRoadmapActions();
  const { language } = useTranslation();
  const english = language === 'en-US';
  return (
    <PagePlaceholder title={english ? 'Archived' : 'Arquivados'} description={english ? 'Projects kept outside the active list.' : 'Projetos preservados fora da lista ativa.'}>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={english ? 'Search archived projects' : 'Buscar arquivados'}
        />
      </div>
      {result.isLoading ? (
        <p className="text-sm text-muted-foreground">{english ? 'Loading projects...' : 'Carregando projetos...'}</p>
      ) : result.error ? (
        <p className="text-sm text-destructive">Não foi possível acessar os dados locais.</p>
      ) : result.data?.length ? (
        <RoadmapCollection
          items={result.data}
          view="grid"
          onEdit={() => undefined}
          onAction={(action, item) => {
            if (action === 'restore') actions.restoreArchived.mutate(item.id);
            if (action === 'delete') actions.softDelete.mutate(item.id);
            if (action === 'duplicate') actions.duplicate.mutate(item.id);
          }}
        />
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 border border-dashed text-center">
          <ArchiveRestore className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium">{english ? 'No archived roadmaps' : 'Nenhum roadmap arquivado'}</p>
        </div>
      )}
    </PagePlaceholder>
  );
}
