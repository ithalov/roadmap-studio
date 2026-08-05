import { Archive, Copy, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Roadmap } from '@/database/models';
import {
  roadmapStatusLabels,
  type RoadmapView,
} from '@/features/roadmap-management/types/roadmap-management';

interface Props {
  items: Roadmap[];
  view: RoadmapView;
  onEdit(item: Roadmap): void;
  onAction(
    action: 'favorite' | 'duplicate' | 'archive' | 'delete' | 'restore',
    item: Roadmap,
  ): void;
}
export function RoadmapCollection({ items, view, onEdit, onAction }: Props) {
  return (
    <div
      className={
        view === 'grid'
          ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
          : 'divide-y rounded-lg border bg-card'
      }
    >
      {items.map((item) => (
        <article
          key={item.id}
          className={
            view === 'grid'
              ? 'rounded-lg border bg-card p-4'
              : 'flex flex-wrap items-center gap-3 p-4'
          }
        >
          <div className="h-9 w-1 rounded-full" style={{ backgroundColor: item.accentColor }} />
          <div className="min-w-0 flex-1">
            <Link className="font-semibold hover:underline" to={`/project/${item.id}`}>
              {item.title}
            </Link>
            <p className="truncate text-sm text-muted-foreground">
              {item.description || 'Sem descrição'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                {roadmapStatusLabels[item.status as keyof typeof roadmapStatusLabels] ??
                  item.status}
              </span>
              <span>{item.category || 'Sem categoria'}</span>
              <span>{item.version}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Favoritar"
              onClick={() => onAction('favorite', item)}
            >
              <Heart
                className={item.isFavorite ? 'h-4 w-4 fill-current text-destructive' : 'h-4 w-4'}
              />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => onEdit(item)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Duplicar"
              onClick={() => onAction('duplicate', item)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {item.status === 'archived' ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Restaurar"
                onClick={() => onAction('restore', item)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Arquivar"
                onClick={() => onAction('archive', item)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir"
              onClick={() => onAction('delete', item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
