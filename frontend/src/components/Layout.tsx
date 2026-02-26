import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { BookOpen, PlusCircle, Library, Settings, LogOut, Shield, Menu, X } from 'lucide-react';
import LoginButton from './LoginButton';
import NotificationBell from './NotificationBell';
import AdminLoginModal from './AdminLoginModal';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const { isAdminMode, logout } = useAdminAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-lg font-semibold text-foreground leading-tight block">
                  گوجری مادری ادب
                </span>
                <span className="text-xs text-muted-foreground leading-tight block">
                  International Gojri Maa Boli Adab
                </span>
              </div>
              <div className="sm:hidden">
                <span className="font-serif text-base font-semibold text-foreground">گوجری ادب</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Home
              </Link>
              {isAdminMode && (
                <>
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Poem
                  </Link>
                  <Link
                    to="/collections"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                  >
                    <Library className="h-4 w-4" />
                    Collections
                  </Link>
                  <Link
                    to="/admin-panel"
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {isAdminMode ? (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="hidden sm:flex items-center gap-1 bg-primary/90 text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Exit Admin</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <NotificationBell />
              <LoginButton />
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/60 py-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAdminMode && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Poem
                  </Link>
                  <Link
                    to="/collections"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Library className="h-4 w-4" />
                    Collections
                  </Link>
                  <Link
                    to="/admin-panel"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                  <div className="px-3 py-2">
                    <Badge variant="default" className="flex items-center gap-1 w-fit bg-primary/90 text-primary-foreground">
                      <Shield className="h-3 w-3" />
                      Admin Mode Active
                    </Badge>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 bg-muted/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-serif text-sm text-muted-foreground">
                International Gojri Maa Boli Adab
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} · Built with{' '}
              <span className="text-red-500">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <AdminLoginModal open={showAdminModal} onOpenChange={setShowAdminModal} />
    </div>
  );
}
