import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Phase } from '@/database/models';
import { toPhaseFormValues } from '@/features/phases/utils/phase-form';
import type { PhaseFormValues } from '@/features/phases/schemas/phase-form';
import { usePhaseHistory } from '@/features/phases/hooks/usePhases';
export function PhasePanel({
  phase,
  saving,
  onClose,
  onSave,
}: {
  phase: Phase | null;
  saving: boolean;
  onClose(): void;
  onSave(values: PhaseFormValues): void;
}) {
  const [values, setValues] = useState<PhaseFormValues | null>(null);
  useEffect(() => setValues(phase ? toPhaseFormValues(phase) : null), [phase]);
  const history = usePhaseHistory(phase?.id ?? '');
  if (!phase || !values) return null;
  const change = <K extends keyof PhaseFormValues>(key: K, value: PhaseFormValues[K]) =>
    setValues((current) => (current ? { ...current, [key]: value } : current));
  return (
    <aside className="fixed inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l bg-card p-5 shadow-xl">
      <div className="mb-5 flex justify-between">
        <h2 className="font-semibold">Editar fase</h2>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>
      <div className="space-y-3">
        <label className="block text-sm">
          Título
          <Input value={values.title} onChange={(e) => change('title', e.target.value)} />
        </label>
        <label className="block text-sm">
          Descrição
          <textarea
            className="mt-1 min-h-24 w-full rounded-lg border bg-background p-2"
            value={values.description}
            onChange={(e) => change('description', e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Progresso
          <Input
            type="number"
            min="0"
            max="100"
            value={values.progress}
            disabled={values.progressMode === 'automatic'}
            onChange={(e) => change('progress', Number(e.target.value))}
          />
        </label>
        <label className="block text-sm">
          Status
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-2"
            value={values.status}
            onChange={(e) => change('status', e.target.value as PhaseFormValues['status'])}
          >
            <option value="planned">Planejada</option>
            <option value="in_progress">Em andamento</option>
            <option value="blocked">Bloqueada</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Início
            <Input
              type="date"
              value={values.startDate ?? ''}
              onChange={(e) => change('startDate', e.target.value || null)}
            />
          </label>
          <label className="text-sm">
            Prazo
            <Input
              type="date"
              value={values.targetDate ?? ''}
              onChange={(e) => change('targetDate', e.target.value || null)}
            />
          </label>
        </div>
        <Button className="w-full" disabled={saving} onClick={() => onSave(values)}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
        <section className="border-t pt-4"><h3 className="text-sm font-semibold">Histórico</h3>{history.isLoading ? <p className="mt-2 text-xs text-muted-foreground">Carregando...</p> : history.data?.length ? <ul className="mt-2 space-y-2 text-xs text-muted-foreground">{history.data.map((item, index) => <li key={`${String(item.occurred_at)}-${index}`}>{String(item.action_type)} - {new Date(String(item.occurred_at)).toLocaleString('pt-BR')}</li>)}</ul> : <p className="mt-2 text-xs text-muted-foreground">Nenhuma alteração registrada.</p>}</section>
      </div>
    </aside>
  );
}
