import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAdminMode } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAdminMode) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-muted">
              <Lock className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground mb-6">
            Yeh page sirf admin ke liye hai. Admin login karein taaki aage ja sakein.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Home Par Jayen
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
