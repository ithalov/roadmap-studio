import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '@/pages/PagePlaceholder';

export function ProjectPresentationPage() {
  const params = useParams<{ id: string }>();

  return (
    <PagePlaceholder
      title="Project Presentation"
      description={`Presentation route for ${params.id ?? 'an unknown project'} is available for future export and display workflows.`}
    />
  );
}
