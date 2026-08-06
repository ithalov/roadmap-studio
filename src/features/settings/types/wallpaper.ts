export const wallpaperStyles = [
  'none',
  'dot-grid',
  'grid',
  'hex',
  'nodes',
  'blueprint',
  'circuit',
  'isometric',
  'geometry',
  'noise',
  'aurora',
] as const;

export type WallpaperStyle = (typeof wallpaperStyles)[number];

export const wallpaperStyleLabels: Record<WallpaperStyle, string> = {
  none: 'Nenhum',
  'dot-grid': 'Dot Grid',
  grid: 'Grid',
  hex: 'Hex',
  nodes: 'Nodes',
  blueprint: 'Blueprint',
  circuit: 'Circuit',
  isometric: 'Isometric',
  geometry: 'Geometry',
  noise: 'Noise',
  aurora: 'Aurora',
};

export const wallpaperIntensityValues = [0, 1, 2, 3, 4, 5] as const;
