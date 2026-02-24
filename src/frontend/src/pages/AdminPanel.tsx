import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useAssignUserRole, useGetIsDraftModeEnabled, usePublishToProduction } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle2, Shield, AlertCircle, Rocket } from 'lucide-react';
import { UserRole } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function AdminPanel() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const { data: isDraftMode, isLoading: isDraftModeLoading } = useGetIsDraftModeEnabled();
  const { mutate: assignRole, isPending, isSuccess, isError, error } = useAssignUserRole();
  const { mutate: publishToProduction, isPending: isPublishing } = usePublishToProduction();

  const [principalId, setPrincipalId] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!principalId.trim()) {
      setValidationError('Please enter a Principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      assignRole(
        { user: principal, role: UserRole.admin },
        {
          onSuccess: () => {
            setPrincipalId('');
            toast.success('Admin role successfully assigned!');
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : 'Failed to assign admin role');
          },
        }
      );
    } catch (err) {
      setValidationError('Invalid Principal ID format');
    }
  };

  const handlePublish = () => {
    publishToProduction(undefined, {
      onSuccess: () => {
        toast.success('Successfully published to production! 🎉');
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to publish to production');
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Panel
            </CardTitle>
            <CardDescription className="text-base">
              Please log in to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-serif flex items-center gap-2">
              <Shield className="h-8 w-8 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-base">
              You do not have permission to access this page. Only administrators can manage user roles.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
      {/* Publish to Production Section */}
      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-serif flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            Publish to Production
          </CardTitle>
          <CardDescription className="text-base">
            {isDraftModeLoading ? (
              'Loading draft mode status...'
            ) : isDraftMode ? (
              'Your app is currently in draft mode. Publish it to make it live and accessible to everyone.'
            ) : (
              'Your app is currently live in production mode.'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isDraftModeLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${isDraftMode ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="font-semibold">
                    Current Status: {isDraftMode ? 'Draft Mode' : 'Production Mode'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isDraftMode
                    ? 'Publishing will make your app live with a permanent URL accessible to all users.'
                    : 'Your app is already live and accessible to everyone.'}
                </p>
              </div>

              {isDraftMode && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" size="lg" disabled={isPublishing}>
                      {isPublishing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Publish to Production
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Publication</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to publish this app to production? This will make it live and accessible to all users with a permanent URL.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePublish}>
                        Publish Now
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {!isDraftMode && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Your app is live in production!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Admin Role Section */}
      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-serif flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Assign Admin Role
          </CardTitle>
          <CardDescription className="text-base">
            Assign admin privileges to users by entering their Principal ID.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="principalId" className="text-base">
                User Principal ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="principalId"
                type="text"
                value={principalId}
                onChange={(e) => {
                  setPrincipalId(e.target.value);
                  setValidationError('');
                }}
                placeholder="Enter Principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                className="font-mono text-sm"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                The Principal ID is the unique identifier for a user on the Internet Computer.
              </p>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Admin role successfully assigned!
                </AlertDescription>
              </Alert>
            )}

            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error instanceof Error ? error.message : 'Failed to assign admin role. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !principalId.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning Role...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Assign Admin Role
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">How to find a user's Principal ID:</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Users can find their Principal ID in their Internet Identity settings</li>
              <li>The Principal ID is displayed after successful authentication</li>
              <li>It's a unique identifier that looks like: xxxxx-xxxxx-xxxxx-xxxxx-xxx</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
