import { CheckCircle2, Compass, Focus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { APP_NAME, APP_VERSION } from '@/config/app';
import { useTranslation } from '@/i18n/useTranslation';

export function AboutPage() {
  const { t } = useTranslation();
  const highlights = [
    { icon: Compass, title: t('aboutWorkspace'), description: t('aboutWorkspaceDescription') },
    { icon: CheckCircle2, title: t('aboutProgress'), description: t('aboutProgressDescription') },
    { icon: Focus, title: t('aboutFlexible'), description: t('aboutFlexibleDescription') },
  ];
  const features = [
    { icon: Sparkles, title: t('featureRoadmaps'), description: t('featureRoadmapsDescription') },
    { icon: CheckCircle2, title: t('featureTasks'), description: t('featureTasksDescription') },
    { icon: Focus, title: t('featureFocus'), description: t('featureFocusDescription') },
  ];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{APP_NAME}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('aboutTitle')}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{t('aboutDescription')}</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{APP_NAME} {APP_VERSION}</span>
          </div>
          <CardTitle className="text-2xl">{t('aboutEyebrow')}</CardTitle>
          <CardDescription>{t('aboutFeatureDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => <div key={title} className="rounded-xl border border-border bg-muted/20 p-5"><Icon className="h-5 w-5 text-primary" /><h2 className="mt-4 font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">{t('aboutFeatureTitle')}</CardTitle><CardDescription>{t('aboutMadeFor')}</CardDescription></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => <div key={title} className="flex gap-3 rounded-xl border border-border p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-medium">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div></div>)}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">{t('aboutFooter')}</p>
    </section>
  );
}
