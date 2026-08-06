import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { RoadmapTemplate } from '@/database/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  templateProjectSchema,
  type TemplateProjectValues,
} from '@/features/templates/schemas/template';

export function TemplateProjectDialog({
  item,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  item: RoadmapTemplate | null;
  open: boolean;
  pending: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(values: TemplateProjectValues): void;
}) {
  const [values, setValues] = useState<TemplateProjectValues>({
    title: '',
    description: '',
    category: '',
    accentColor: '#2563EB',
  });
  useEffect(() => {
    if (item) {
      setValues({
        title: item.name,
        description: item.description,
        category: item.category,
        accentColor: item.color,
      });
    }
  }, [item]);
  if (!item) return null;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">Criar projeto</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Uma cópia será criada a partir de {item.name}.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(templateProjectSchema.parse(values));
            }}
          >
            <label className="block text-sm font-medium">
              Nome do projeto
              <Input
                className="mt-1"
                autoFocus
                value={values.title}
                onChange={(event) => setValues({ ...values, title: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              Descrição
              <textarea
                className="mt-1 min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Categoria
                <Input
                  className="mt-1"
                  value={values.category}
                  onChange={(event) => setValues({ ...values, category: event.target.value })}
                />
              </label>
              <label className="text-sm font-medium">
                Cor
                <Input
                  className="mt-1"
                  value={values.accentColor}
                  onChange={(event) => setValues({ ...values, accentColor: event.target.value })}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button disabled={pending} type="submit">
                {pending ? 'Criando...' : 'Criar projeto'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
