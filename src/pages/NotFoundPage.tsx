import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PagePlaceholder } from '@/pages/PagePlaceholder';

export function NotFoundPage() {
  return (
    <PagePlaceholder
      title="404"
      description="The requested route does not exist in the current foundation scaffold."
    >
      <Button asChild className="w-fit">
        <Link to="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>
    </PagePlaceholder>
  );
}
