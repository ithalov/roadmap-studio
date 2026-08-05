import { APP_NAME } from '@/config/app';

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
        <img src="/logo.png" alt="" aria-hidden="true" className="h-full w-full object-cover" />
      </div>
      {compact ? null : (
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">Local-first roadmap workspace</p>
        </div>
      )}
    </div>
  );
}
