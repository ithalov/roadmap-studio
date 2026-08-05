import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface PageShellProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
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
        <div className="flex min-h-[280px] flex-col justify-between gap-6 p-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </Card>
    </section>
  );
}
