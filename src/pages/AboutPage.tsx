import { APP_DESCRIPTION, APP_NAME, APP_RELEASE_NAME, APP_VERSION } from '@/config/app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Globe2, HardDriveDownload, Sparkles, ShieldCheck, Tag } from 'lucide-react';

type AboutItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const highlights: AboutItem[] = [
  {
    icon: Sparkles,
    title: 'Local-first',
    description: 'Os dados vivem no dispositivo e seguem uma base preparada para evoluir com segurança.',
  },
  {
    icon: ShieldCheck,
    title: 'Atualizacao assinada',
    description: 'As releases publicadas no GitHub usam o fluxo de updater do Tauri para instalar novas versoes.',
  },
  {
    icon: Globe2,
    title: 'Pronto para crescer',
    description: 'A arquitetura foi montada para suportar persistencia, importacao e futuras integracoes.',
  },
];

const details = [
  { label: 'Produto', value: APP_NAME },
  { label: 'Versao', value: APP_VERSION },
  { label: 'Release', value: APP_RELEASE_NAME },
  { label: 'Atualizacao', value: 'GitHub Releases' },
  { label: 'Banco', value: 'SQLite local' },
  { label: 'Empacotamento', value: 'Tauri MSI' },
];

export function AboutPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Roadmap Studio
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Sobre</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{APP_DESCRIPTION}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {APP_RELEASE_NAME}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                Build publica via GitHub Actions
              </span>
            </div>
            <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
            <CardDescription>
              Um workspace local-first para planejar roadmaps, fases e tarefas com base preparada para evolucao.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Versao e entrega</CardTitle>
            <CardDescription>Os metadados abaixo sao usados na release, na tela Sobre e no updater.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {details.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-3 rounded-xl border border-border px-4 py-3">
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="text-sm font-medium text-right">{item.value}</div>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Quando criarmos uma nova build, a release publica deve seguir o padrao <span className="font-medium text-foreground">{APP_RELEASE_NAME}</span>.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">O que este build cobre</CardTitle>
          <CardDescription>Resumo do estado atual da plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDriveDownload className="h-4 w-4 text-primary" />
              Persistencia local
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              SQLite, migrações, repositorios e validacao em camada centralizada.
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Fluxo de atualizacao
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Releases publicadas no GitHub alimentam o updater interno do aplicativo.
            </p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-primary" />
              Versionamento
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Cada build recebe versao propria e nome legivel para facilitar validacao e suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
