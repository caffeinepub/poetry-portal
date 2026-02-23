import { useEffect } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRouteGuard() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin, isFetched } = useIsCallerAdmin();

  useEffect(() => {
    // Wait for authentication and admin check to complete
    if (isInitializing || isCheckingAdmin || !isFetched) {
      return;
    }

    // If not authenticated, redirect to home
    if (!identity) {
      toast.error('Please login to access this page');
      navigate({ to: '/' });
      return;
    }

    // If authenticated but not admin, redirect to home
    if (identity && !isAdmin) {
      toast.error('Access denied: Admin privileges required');
      navigate({ to: '/' });
      return;
    }
  }, [identity, isAdmin, isInitializing, isCheckingAdmin, isFetched, navigate]);

  // Show loading state while checking authentication and admin status
  if (isInitializing || isCheckingAdmin || !isFetched) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If authenticated and admin, render the protected route
  if (identity && isAdmin) {
    return <Outlet />;
  }

  // Fallback: show nothing while redirecting
  return null;
}
