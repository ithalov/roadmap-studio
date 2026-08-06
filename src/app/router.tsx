import { createHashRouter } from 'react-router-dom';
import { ArchivedPage } from '@/pages/ArchivedPage';
import { TrashPage } from '@/pages/TrashPage';
import { AppLayout } from '@/layouts/AppLayout';
import { AboutPage } from '@/pages/AboutPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectEditorPage } from '@/pages/ProjectEditorPage';
import { ProjectPage } from '@/pages/ProjectPage';
import { ProjectKanbanPage } from '@/pages/ProjectKanbanPage';
import { ProjectPresentationPage } from '@/pages/ProjectPresentationPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TemplatesPage } from '@/pages/TemplatesPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'archived', element: <ArchivedPage /> },
      { path: 'trash', element: <TrashPage /> },
      { path: 'project/:id', element: <ProjectPage /> },
      { path: 'project/:id/kanban', element: <ProjectKanbanPage /> },
      { path: 'project/:id/editor', element: <ProjectEditorPage /> },
      { path: 'project/:id/presentation', element: <ProjectPresentationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
