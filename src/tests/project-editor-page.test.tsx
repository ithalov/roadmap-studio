import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectEditorPage } from '@/pages/ProjectEditorPage';
import type { Phase } from '@/database/models';
import {
  useDeletedPhases,
  usePhaseActions,
  usePhaseHistory,
  usePhases,
} from '@/features/phases/hooks/usePhases';
import { useToast } from '@/components/feedback/useToast';

vi.mock('@/features/phases/hooks/usePhases', () => ({
  usePhases: vi.fn(),
  useDeletedPhases: vi.fn(),
  usePhaseHistory: vi.fn(),
  usePhaseActions: vi.fn(),
}));

vi.mock('@/components/feedback/useToast', () => ({
  useToast: vi.fn(),
}));

const activePhase: Phase = {
  id: 'phase-1',
  roadmapId: 'roadmap-1',
  title: 'Fase ativa',
  description: '',
  position: 0,
  status: 'planned',
  priority: 'medium',
  progress: 0,
  startDate: null,
  targetDate: null,
  progressMode: 'manual',
  completedAt: null,
  color: null,
  icon: null,
  isCollapsed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
  syncStatus: 'pending',
  localVersion: 1,
  serverVersion: 0,
  deviceId: 'test-device',
};

const deletedPhase: Phase = {
  ...activePhase,
  id: 'phase-2',
  title: 'Fase removida',
  deletedAt: '2026-01-02T00:00:00.000Z',
};

function createMutation() {
  return {
    isPending: false,
    mutate: vi.fn((...args: unknown[]) => {
      const options = args[1] as { onSuccess?: () => void } | undefined;
      options?.onSuccess?.();
    }),
  };
}

const toast = { show: vi.fn() };
const phaseActions = {
  create: createMutation(),
  update: createMutation(),
  reorder: createMutation(),
  remove: createMutation(),
  restore: createMutation(),
  permanentDelete: createMutation(),
};

describe('ProjectEditorPage', () => {
  beforeEach(() => {
    toast.show.mockClear();
    vi.mocked(useToast).mockReturnValue(toast);
    vi.mocked(usePhases).mockReturnValue({
      isLoading: false,
      data: [activePhase],
    } as unknown as ReturnType<typeof usePhases>);
    vi.mocked(useDeletedPhases).mockReturnValue({
      isLoading: false,
      data: [deletedPhase],
    } as unknown as ReturnType<typeof useDeletedPhases>);
    vi.mocked(usePhaseHistory).mockReturnValue({
      isLoading: false,
      data: [],
    } as unknown as ReturnType<typeof usePhaseHistory>);
    vi.mocked(usePhaseActions).mockReturnValue(
      phaseActions as unknown as ReturnType<typeof usePhaseActions>,
    );
  });

  it('wires editor actions to trash and restore controls', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/project/roadmap-1/editor']}>
          <Routes>
            <Route path="/project/:id/editor" element={<ProjectEditorPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Fase ativa')).toBeInTheDocument();
    expect(screen.getByText('Fases excluídas')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir fase' }));
    expect(phaseActions.remove.mutate).toHaveBeenCalledWith(
      'phase-1',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(toast.show).toHaveBeenCalledWith('Fase movida para a lixeira.');

    const trashSection = screen.getByText('Fases excluídas').closest('section');
    expect(trashSection).not.toBeNull();

    await user.click(within(trashSection as HTMLElement).getByRole('button', { name: 'Restaurar' }));
    expect(phaseActions.restore.mutate).toHaveBeenCalledWith(
      'phase-2',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(toast.show).toHaveBeenCalledWith('Fase restaurada.');

    await user.click(within(trashSection as HTMLElement).getByRole('button', { name: 'Excluir' }));
    expect(phaseActions.permanentDelete.mutate).toHaveBeenCalledWith(
      'phase-2',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(toast.show).toHaveBeenCalledWith('Fase excluída permanentemente.');
  });
});
