import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppCommandPalette } from '@/components/app/AppCommandPalette';
import { AppTopbar } from '@/components/app/AppTopbar';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import type { Roadmap } from '@/database/models';
import { useRoadmaps } from '@/features/roadmap-management/hooks/useRoadmaps';
import { useUIStore } from '@/store/ui-store';

vi.mock('@/features/roadmap-management/hooks/useRoadmaps', () => ({
  useRoadmaps: vi.fn(),
}));

const roadmap: Roadmap = {
  id: 'roadmap-1',
  title: 'Jogo Indie',
  description: 'Roadmap do projeto principal',
  version: '0.1.5',
  category: 'Game',
  status: 'draft',
  accentColor: '#2563EB',
  progressMode: 'automatic',
  progress: 75,
  isFavorite: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  deletedAt: null,
  syncStatus: 'pending',
  localVersion: 1,
  serverVersion: 0,
  deviceId: 'test-device',
};

describe('AppCommandPalette', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    useUIStore.getState().setCommandPaletteOpen(false);
    vi.mocked(useRoadmaps).mockReturnValue({
      isLoading: false,
      data: [roadmap],
    } as unknown as ReturnType<typeof useRoadmaps>);
  });

  it('opens from the topbar and shows roadmap results', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider>
          <TooltipProvider>
            <MemoryRouter>
              <AppTopbar />
              <AppCommandPalette />
            </MemoryRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Search, go to, create' }));

    expect(screen.getByPlaceholderText('Buscar projetos ou navegar')).toBeInTheDocument();
    expect(screen.getByText('Jogo Indie')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
