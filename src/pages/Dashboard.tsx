
import { useAuth } from '@/hooks/useAuth';
import { useAppLoadingState } from '@/hooks/useAppLoadingState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AuthPage from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, authError } = useAuth();
  const { isCriticalLoading, hasMinimumData } = useAppLoadingState();

  console.log('Dashboard render decision:', {
    isCriticalLoading,
    hasMinimumData,
    hasUser: !!user,
    hasProfile: !!profile,
    authError: !!authError,
    profileRole: profile?.role
  });

  // Show loading ONLY for critical loading (auth actually loading)
  if (isCriticalLoading) {
    console.log('Dashboard: Showing critical loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span>Loading application...</span>
        </div>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    console.log('Dashboard: Showing auth error');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no user, show auth page
  if (!user) {
    console.log('Dashboard: No user, showing auth page');
    return <AuthPage />;
  }

  // If we don't have minimum data, show simple loading with timeout fallback
  if (!hasMinimumData) {
    console.log('Dashboard: Waiting for minimum data');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your workspace...</p>
          <p className="text-sm text-muted-foreground mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  console.log('Dashboard: Rendering dashboard layout');
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
