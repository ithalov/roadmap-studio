import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Roadmap Studio
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </header>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[240px] flex-col justify-between gap-4">
          {children ?? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">
              Foundation scaffold only
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
