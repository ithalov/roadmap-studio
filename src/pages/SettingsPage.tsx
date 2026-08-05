import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, FileJson, FolderUp, Palette, Save, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/feedback/useToast';
import { useRoadmapImport } from '@/features/roadmap-management/hooks/useRoadmapImport';
import { useSettings, useSaveSettings } from '@/features/settings/hooks/useSettings';
import {
  defaultSettingsFormValues,
  settingsFormSchema,
  type SettingsFormValues,
} from '@/features/settings/schemas/settings-form';
import { useThemeStore } from '@/store/theme-store';

function readError(error: unknown): string {
  return error instanceof Error ? error.message : 'Nao foi possivel concluir a operacao.';
}

export function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const setTheme = useThemeStore((state) => state.setTheme);
  const query = useSettings();
  const save = useSaveSettings();
  const importer = useRoadmapImport();
  const inputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<SettingsFormValues>(defaultSettingsFormValues);

  useEffect(() => {
    if (!query.data) return;
    setValues({
      theme: query.data.theme,
      language: query.data.language,
      accentColor: query.data.accentColor,
      autosave: query.data.autosave,
      backupInterval: query.data.backupInterval,
      workspace: query.data.workspace,
    });
  }, [query.data]);

  const update = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = settingsFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.show('Revise os valores das configuracoes.', 'error');
      return;
    }
    save.mutate(parsed.data, {
      onSuccess: (settings) => {
        setTheme(settings.theme);
        toast.show('Configuracoes salvas.');
      },
      onError: (error) => toast.show(readError(error), 'error'),
    });
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const content: unknown = JSON.parse(await file.text());
      importer.mutate(content, {
        onSuccess: (result) => {
          toast.show(`Roadmap importado com ${result.phases} fase(s) e ${result.tasks} tarefa(s).`);
          navigate(`/project/${result.roadmapId}`);
        },
        onError: (error) => toast.show(`Importacao invalida: ${readError(error)}`, 'error'),
      });
    } catch (error) {
      toast.show(`Arquivo JSON invalido: ${readError(error)}`, 'error');
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          Preferencias do aplicativo
        </div>
        <h1 className="mt-2 text-2xl font-semibold">Configuracoes</h1>
      </header>

      {query.isLoading ? <p className="text-sm text-muted-foreground">Carregando configuracoes...</p> : null}
      {query.isError ? <p className="text-sm text-destructive">Nao foi possivel carregar as configuracoes.</p> : null}

      <form className="flex flex-col gap-5" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>Aparencia e idioma</CardTitle>
            <CardDescription>Defina como o Roadmap Studio sera apresentado neste dispositivo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Tema
              <select
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                value={values.theme}
                onChange={(event) => update('theme', event.target.value as SettingsFormValues['theme'])}
              >
                <option value="system">Sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Idioma
              <select
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                value={values.language}
                onChange={(event) => update('language', event.target.value as SettingsFormValues['language'])}
              >
                <option value="pt-BR">Portugues (Brasil)</option>
                <option value="en-US">English (United States)</option>
              </select>
            </label>
            <div className="grid gap-2">
              <Label htmlFor="accent-color">Cor de destaque</Label>
              <div className="flex h-10 items-center gap-3 rounded-xl border border-border bg-background px-3">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <input
                  id="accent-color"
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(values.accentColor) ? values.accentColor : '#2563EB'}
                  onChange={(event) => update('accentColor', event.target.value)}
                />
                <span className="font-mono text-sm text-muted-foreground">{values.accentColor}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Persistencia local</CardTitle>
            <CardDescription>Controle o salvamento automatico e identifique o workspace local.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Salvamento automatico</p>
                <p className="text-sm text-muted-foreground">Mantem as alteracoes sincronizadas na fila local.</p>
              </div>
              <Switch checked={values.autosave} onCheckedChange={(checked) => update('autosave', checked)} />
            </div>
            <div className="grid gap-2 sm:max-w-xs">
              <Label htmlFor="backup-interval">Intervalo de backup (minutos)</Label>
              <Input
                id="backup-interval"
                type="number"
                min="1"
                max="525600"
                value={values.backupInterval}
                onChange={(event) => update('backupInterval', Number(event.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Input id="workspace" value={values.workspace} onChange={(event) => update('workspace', event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={save.isPending || query.isLoading}>
            <Save className="h-4 w-4" />
            {save.isPending ? 'Salvando...' : 'Salvar configuracoes'}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Importar roadmap</CardTitle>
          <CardDescription>Importe um arquivo JSON de roadmap para criar um novo projeto com fases e tarefas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <FileJson className="h-5 w-5" />
            O arquivo deve usar a versao 1 do formato de importacao.
          </div>
          <input ref={inputRef} className="sr-only" type="file" accept="application/json,.json" onChange={importFile} />
          <Button type="button" variant="outline" disabled={importer.isPending} onClick={() => inputRef.current?.click()}>
            {importer.isPending ? <Check className="h-4 w-4" /> : <FolderUp className="h-4 w-4" />}
            {importer.isPending ? 'Importando...' : 'Selecionar JSON'}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
