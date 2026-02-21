import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { BookOpen, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  // Generate app identifier for UTM tracking
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'poetry-portal'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <h1 className="text-2xl font-serif font-bold text-foreground">Poetry Portal</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="text-muted-foreground hover:text-foreground"
            >
              Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/admin' })}
              className="gap-2"
            >
              <PenTool className="h-4 w-4" />
              Add Poem
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <p>© {currentYear} Poetry Portal. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with{' '}
              <span className="text-destructive animate-pulse">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
