import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { useTranslation } from '@/i18n/useTranslation';
export function ProjectKanbanPage() { const { id='' }=useParams<{ id:string }>(); const { language } = useTranslation(); return <section className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-[1600px] flex-col gap-4"><Button asChild variant="ghost" size="sm" className="w-fit"><Link to={`/project/${id}`}><ArrowLeft className="h-4 w-4"/>{language === 'en-US' ? 'Project' : 'Projeto'}</Link></Button><KanbanBoard roadmapId={id}/></section>; }
