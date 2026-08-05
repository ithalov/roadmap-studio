import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PhasePanel } from '@/features/phases/components/PhasePanel';
import type { Phase } from '@/database/models';
vi.mock('@/features/phases/services/PhaseService', () => ({ phaseService: { history: vi.fn(async () => []) } }));
const phase: Phase = { id: 'phase-1', roadmapId: 'roadmap-1', title: 'Fundação', description: '', position: 0, status: 'planned', priority: 'medium', progress: 0, progressMode: 'manual', startDate: null, targetDate: null, completedAt: null, color: null, icon: null, isCollapsed: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', deletedAt: null, syncStatus: 'pending', localVersion: 1, serverVersion: 0, deviceId: 'test' };
describe('PhasePanel', () => { it('renders editor fields and empty history', async () => { render(<QueryClientProvider client={new QueryClient()}><PhasePanel phase={phase} saving={false} onClose={vi.fn()} onSave={vi.fn()} /></QueryClientProvider>); expect(screen.getByText('Editar fase')).toBeInTheDocument(); expect(await screen.findByText('Nenhuma alteração registrada.')).toBeInTheDocument(); }); });
