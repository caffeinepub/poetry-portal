import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useAssignUserRole } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { UserRole } from '../backend';
import { Principal } from '@dfinity/principal';

export default function AdminPanel() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsCallerAdmin();
  const { mutate: assignRole, isPending, isSuccess, isError, error } = useAssignUserRole();

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
            setTimeout(() => {
              // Reset success state after 3 seconds
            }, 3000);
          },
        }
      );
    } catch (err) {
      setValidationError('Invalid Principal ID format');
    }
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
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="border-border/40 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-serif flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Panel
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
