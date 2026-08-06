import type { RoadmapTemplate } from '@/database/models';
import { TemplateCard } from '@/features/templates/components/TemplateCard';

export function TemplateGallery({
  items,
  selectedId,
  onSelect,
}: {
  items: RoadmapTemplate[];
  selectedId: string | null;
  onSelect(item: RoadmapTemplate): void;
}) {
  if (!items.length)
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <p className="font-medium">Nenhum template encontrado.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Salve um projeto como template ou importe um arquivo.
        </p>
      </div>
    );
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <TemplateCard
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onSelect={() => onSelect(item)}
        />
      ))}
    </div>
  );
}
