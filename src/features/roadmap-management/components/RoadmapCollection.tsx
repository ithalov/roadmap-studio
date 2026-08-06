import { Archive, Copy, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Roadmap } from '@/database/models';
import { categoryBadgeMeta, progressBadgeMeta, statusBadgeMeta } from '@/features/badges/constants/badge-catalog';
import type { RoadmapView } from '@/features/roadmap-management/types/roadmap-management';

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
        (() => {
          const category = categoryBadgeMeta(item.category);
          const status = statusBadgeMeta(item.status);
          const progress = progressBadgeMeta(item.progress);
          return (
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
              {item.description || 'Sem descricao'}
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <Badge variant="progress" size="sm" label={progress.label} color={progress.color} tooltip={progress.tooltip} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.progress}%`, backgroundColor: item.accentColor }}
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="status" label={status.label} icon={status.icon} color={status.color} tooltip={status.tooltip} />
              <Badge variant="category" label={category.label} icon={category.icon} color={category.color} tooltip={category.tooltip} />
              <Badge variant="neutral" label={`v${item.version}`} tooltip={`Versao ${item.version}`} />
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
          );
        })()
      ))}
    </div>
  );
}
