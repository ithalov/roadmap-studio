import { Search, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { useUIStore } from '@/store/ui-store';

export function AppTopbar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="hidden h-10 min-w-[18rem] justify-start gap-2 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground md:flex"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search, go to, create</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      <Separator />
    </header>
  );
}
