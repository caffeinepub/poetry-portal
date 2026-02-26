import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AdminRouteGuard from '../components/AdminRouteGuard';
import { useGetIsDraftModeEnabled, usePublishToProduction } from '../hooks/useQueries';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { data: isDraftMode, isLoading: draftLoading } = useGetIsDraftModeEnabled();
  const publishMutation = usePublishToProduction();
  const [publishError, setPublishError] = useState('');

  const handlePublish = async () => {
    setPublishError('');
    try {
      await publishMutation.mutateAsync();
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : 'Publish karne mein masla hua');
    }
  };

  return (
    <AdminRouteGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate({ to: '/' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wapas Jayen
        </Button>

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">App settings aur publishing manage karein</p>
        </div>

        {/* Draft Mode Status */}
        <div className="bg-card border border-border/60 rounded-xl p-6 mb-6">
          <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            App Status
          </h2>

          {draftLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge variant={isDraftMode ? 'secondary' : 'default'}>
                {isDraftMode ? 'Draft Mode' : 'Live / Production'}
              </Badge>
            </div>
          )}

          {isDraftMode && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Draft Mode Active</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    App abhi draft mode mein hai. Publish karein taaki yeh live ho jaye.
                  </p>
                </div>
              </div>
            </div>
          )}

          {publishError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-4">
              ⚠ {publishError}
            </p>
          )}

          {isDraftMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex items-center gap-2" disabled={publishMutation.isPending}>
                  {publishMutation.isPending ? (
                    <>
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      Publish to Production
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Production Mein Publish Karein?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Kya aap app ko production mein publish karna chahte hain? Draft mode band ho jayega.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePublish}>
                    Haan, Publish Karein
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isDraftMode && !draftLoading && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ App live hai aur production mein chal raha hai
            </p>
          )}
        </div>
      </div>
    </AdminRouteGuard>
  );
}
