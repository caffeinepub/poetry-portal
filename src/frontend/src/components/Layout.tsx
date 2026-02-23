import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { BookOpen, PenTool, FolderOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import LoginButton from './LoginButton';
import NotificationBell from './NotificationBell';

export default function Layout() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCallerAdmin();
  
  // Generate app identifier for UTM tracking
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'gojri-adab'
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <Link to="/" className="flex items-center gap-3 group">
            <BookOpen className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              International Gojri Maa Boli Adab
            </h1>
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/admin' })}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <PenTool className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Poem</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/admin/collections' })}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Collections</span>
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/admin/users' })}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Button>
                )}
                <NotificationBell />
              </>
            )}
            <LoginButton />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Made by SC05 Sohail Ch</p>
            <p>© {currentYear} International Gojri Maa Boli Adab. All rights reserved.</p>
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
