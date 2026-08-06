import { Heart, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { templateCategories, type TemplateFilters } from '@/features/templates/types/template';

export function TemplateFilters({
  filters,
  onChange,
}: {
  filters: TemplateFilters;
  onChange(value: TemplateFilters): void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
      <div className="relative min-w-56 flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={filters.query ?? ''}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Buscar templates"
        />
      </div>
      <select
        className="h-10 rounded-lg border bg-background px-3 text-sm"
        value={filters.category ?? ''}
        onChange={(event) => onChange({ ...filters, category: event.target.value || undefined })}
      >
        <option value="">Todas as categorias</option>
        {templateCategories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <select
        className="h-10 rounded-lg border bg-background px-3 text-sm"
        value={filters.sort ?? 'recent'}
        onChange={(event) =>
          onChange({ ...filters, sort: event.target.value as TemplateFilters['sort'] })
        }
      >
        <option value="recent">Mais recentes</option>
        <option value="used">Mais usados</option>
        <option value="name_asc">Nome A-Z</option>
        <option value="name_desc">Nome Z-A</option>
        <option value="phases">Mais fases</option>
      </select>
      <Button
        variant={filters.favorite ? 'secondary' : 'outline'}
        size="icon"
        aria-label="Mostrar favoritos"
        onClick={() => onChange({ ...filters, favorite: !filters.favorite })}
      >
        <Heart className="h-4 w-4" />
      </Button>
    </div>
  );
}
