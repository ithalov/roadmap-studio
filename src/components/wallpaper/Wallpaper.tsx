import { useId, type ReactNode } from 'react';
import type { WallpaperStyle } from '@/features/settings/types/wallpaper';
import { cn } from '@/utils/cn';

interface WallpaperProps {
  style: WallpaperStyle;
  intensity: number;
  className?: string;
}

function Wrapper({
  children,
  className,
  opacity,
}: {
  children: ReactNode;
  className?: string;
  opacity: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
      style={{ color: 'hsl(var(--muted-foreground))', opacity }}
    >
      {children}
    </div>
  );
}

export function Wallpaper({ style, intensity, className }: WallpaperProps) {
  const rawId = useId().replace(/:/g, '');
  const opacity = style === 'none' || intensity <= 0 ? 0 : Math.min(0.05, intensity / 100);

  if (opacity <= 0) return null;

  if (style === 'noise') {
    return (
      <Wrapper opacity={opacity} className={className}>
        <svg aria-hidden="true" focusable="false" className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 900">
          <defs>
            <filter id={`${rawId}-noise`} x="0" y="0" width="1200" height="900">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="2"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="1200" height="900" fill="currentColor" filter={`url(#${rawId}-noise)`} />
        </svg>
      </Wrapper>
    );
  }

  if (style === 'aurora') {
    return (
      <Wrapper opacity={opacity} className={className}>
        <svg aria-hidden="true" focusable="false" className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 900">
          <defs>
            <radialGradient id={`${rawId}-a`} cx="30%" cy="20%" r="60%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${rawId}-b`} cx="75%" cy="35%" r="55%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <filter id={`${rawId}-blur`}>
              <feGaussianBlur stdDeviation="60" />
            </filter>
          </defs>
          <g filter={`url(#${rawId}-blur)`}>
            <ellipse cx="280" cy="210" rx="360" ry="240" fill={`url(#${rawId}-a)`} />
            <ellipse cx="930" cy="270" rx="320" ry="240" fill={`url(#${rawId}-b)`} />
            <ellipse cx="720" cy="700" rx="420" ry="260" fill={`url(#${rawId}-a)`} />
          </g>
        </svg>
      </Wrapper>
    );
  }

  const isometricGeometry = (
    <pattern id={`${rawId}-pattern`} width="80" height="46" patternUnits="userSpaceOnUse">
      <path
        d="M0 23 20 3 40 23 20 43Z M40 23 60 3 80 23 60 43Z"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="0.65"
      />
    </pattern>
  );

  const patterns: Record<Exclude<WallpaperStyle, 'none' | 'noise' | 'aurora'>, ReactNode> = {
    'dot-grid': (
      <pattern id={`${rawId}-pattern`} width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.25" fill="currentColor" fillOpacity="0.85" />
      </pattern>
    ),
    grid: (
      <pattern id={`${rawId}-pattern`} width="72" height="72" patternUnits="userSpaceOnUse">
        <path d="M72 0H0V72" fill="none" stroke="currentColor" strokeOpacity="0.65" strokeWidth="0.7" />
      </pattern>
    ),
    hex: (
      <pattern id={`${rawId}-pattern`} width="64" height="56" patternUnits="userSpaceOnUse">
        <path
          d="M32 4 52 16v24L32 52 12 40V16Z"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="0.7"
        />
      </pattern>
    ),
    nodes: (
      <pattern id={`${rawId}-pattern`} width="96" height="96" patternUnits="userSpaceOnUse">
        <path
          d="M0 48H48M48 48V0M48 48H96M48 48V96"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="0.7"
        />
        <circle cx="48" cy="48" r="2.25" fill="currentColor" fillOpacity="0.85" />
        <circle cx="0" cy="48" r="1.5" fill="currentColor" fillOpacity="0.7" />
        <circle cx="96" cy="48" r="1.5" fill="currentColor" fillOpacity="0.7" />
        <circle cx="48" cy="0" r="1.5" fill="currentColor" fillOpacity="0.7" />
        <circle cx="48" cy="96" r="1.5" fill="currentColor" fillOpacity="0.7" />
      </pattern>
    ),
    blueprint: (
      <pattern id={`${rawId}-pattern`} width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M0 0H80M0 20H80M0 40H80M0 60H80M0 80H80" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.55" />
        <path d="M0 0V80M20 0V80M40 0V80M60 0V80M80 0V80" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.55" />
        <path d="M8 8H24M8 8V24M56 56H72M56 56V72" fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="0.7" />
      </pattern>
    ),
    circuit: (
      <pattern id={`${rawId}-pattern`} width="96" height="96" patternUnits="userSpaceOnUse">
        <path
          d="M0 24H28V12H64V44H96"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="0.8"
        />
        <path
          d="M0 72H20V56H52V84H96"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="0.8"
        />
        <circle cx="28" cy="24" r="2.2" fill="currentColor" fillOpacity="0.85" />
        <circle cx="64" cy="12" r="2.2" fill="currentColor" fillOpacity="0.85" />
        <circle cx="52" cy="56" r="2.2" fill="currentColor" fillOpacity="0.85" />
      </pattern>
    ),
    isometric: isometricGeometry,
    geometry: (
      <pattern id={`${rawId}-pattern`} width="110" height="110" patternUnits="userSpaceOnUse">
        <path d="M18 88 55 18 92 88Z" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.7" />
        <path d="M0 44 22 12 44 44Z M66 44 88 12 110 44Z" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.7" />
      </pattern>
    ),
  };

  return (
    <Wrapper opacity={opacity} className={className}>
      <svg
        aria-hidden="true"
        focusable="false"
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1200 900"
      >
        <defs>{patterns[style as Exclude<WallpaperStyle, 'none' | 'noise' | 'aurora'>]}</defs>
        <rect width="1200" height="900" fill={`url(#${rawId}-pattern)`} />
      </svg>
    </Wrapper>
  );
}
