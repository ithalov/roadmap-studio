import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Roadmap } from '@/database/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  templateCreateSchema,
  type TemplateCreateValues,
} from '@/features/templates/schemas/template';

export function SaveTemplateDialog({
  roadmap,
  open,
  pending,
  onOpenChange,
  onSubmit,
}: {
  roadmap: Roadmap;
  open: boolean;
  pending: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(values: TemplateCreateValues): void;
}) {
  const [values, setValues] = useState<TemplateCreateValues>({
    name: roadmap.title,
    description: roadmap.description,
    category: roadmap.category || 'Other',
    tags: [],
    coverImage: null,
    icon: null,
    color: roadmap.accentColor,
    author: '',
    version: '1.0.0',
  });
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold">Salvar como template</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                O roadmap original continuará inalterado.
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
              onSubmit(templateCreateSchema.parse(values));
            }}
          >
            <label className="block text-sm font-medium">
              Nome
              <Input
                className="mt-1"
                autoFocus
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              Descrição
              <textarea
                className="mt-1 min-h-20 w-full rounded-lg border bg-background p-3 text-sm"
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
                Versão
                <Input
                  className="mt-1"
                  value={values.version}
                  onChange={(event) => setValues({ ...values, version: event.target.value })}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Tags
              <Input
                className="mt-1"
                placeholder="React, Tauri, SQLite"
                onChange={(event) =>
                  setValues({
                    ...values,
                    tags: event.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-sm font-medium">
                Ícone
                <Input
                  className="mt-1"
                  placeholder="🚀"
                  value={values.icon ?? ''}
                  onChange={(event) => setValues({ ...values, icon: event.target.value || null })}
                />
              </label>
              <label className="text-sm font-medium">
                Cor
                <Input
                  className="mt-1"
                  value={values.color}
                  onChange={(event) => setValues({ ...values, color: event.target.value })}
                />
              </label>
              <label className="text-sm font-medium">
                Autor
                <Input
                  className="mt-1"
                  value={values.author}
                  onChange={(event) => setValues({ ...values, author: event.target.value })}
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
                {pending ? 'Salvando...' : 'Salvar template'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
