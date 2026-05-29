import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isLaunched, isPreviewHost } from '@/lib/launchGate';
import { Loader2 } from 'lucide-react';

/**
 * Blocks access to any wrapped route until:
 *  - the launch date has passed, OR
 *  - the visitor is signed in (early access), OR
 *  - we're inside the Lovable preview/sandbox (so editing isn't broken).
 * Otherwise redirects to "/" (the countdown page).
 */
export function LaunchGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (isPreviewHost() || isLaunched()) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  return <>{children}</>;
}
