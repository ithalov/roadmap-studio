import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Roadmap } from '@/database/models';
import {
  roadmapFormSchema,
  type RoadmapFormValues,
} from '@/features/roadmap-management/schemas/roadmap-form';
import {
  roadmapStatusLabels,
  type RoadmapStatus,
} from '@/features/roadmap-management/types/roadmap-management';

const defaults: RoadmapFormValues = {
  title: '',
  description: '',
  version: '0.1.0',
  category: '',
  status: 'draft',
  accentColor: '#2563EB',
  progressMode: 'automatic',
};
interface Props {
  open: boolean;
  roadmap?: Roadmap | null;
  pending?: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(values: RoadmapFormValues): void;
}
export function RoadmapFormDialog({ open, roadmap, pending, onOpenChange, onSubmit }: Props) {
  const form = useForm({ resolver: zodResolver(roadmapFormSchema), defaultValues: defaults });
  useEffect(() => {
    form.reset(
      roadmap
        ? {
            title: roadmap.title,
            description: roadmap.description,
            version: roadmap.version,
            category: roadmap.category,
            status: roadmap.status as RoadmapStatus,
            accentColor: roadmap.accentColor,
            progressMode: roadmap.progressMode === 'manual' ? 'manual' : 'automatic',
          }
        : defaults,
    );
  }, [form, roadmap, open]);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">
              {roadmap ? 'Editar roadmap' : 'Novo roadmap'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => onSubmit(roadmapFormSchema.parse(values)))}
          >
            <label className="block text-sm font-medium">
              Título
              <Input className="mt-1" autoFocus {...form.register('title')} />
              {form.formState.errors.title && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </span>
              )}
            </label>
            <label className="block text-sm font-medium">
              Descrição
              <textarea
                className="mt-1 min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
                {...form.register('description')}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Versão
                <Input className="mt-1" {...form.register('version')} />
              </label>
              <label className="text-sm font-medium">
                Categoria
                <Input className="mt-1" {...form.register('category')} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Status
                <select
                  className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
                  {...form.register('status')}
                >
                  {Object.entries(roadmapStatusLabels)
                    .filter(([value]) => value !== 'archived')
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Cor
                <Input className="mt-1" {...form.register('accentColor')} />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={pending}>
                {pending ? 'Salvando...' : roadmap ? 'Salvar' : 'Criar roadmap'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
