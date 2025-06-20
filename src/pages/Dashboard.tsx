
import { useAuth } from '@/hooks/useAuth';
import { useAppLoadingState } from '@/hooks/useAppLoadingState';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AuthPage from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, authError } = useAuth();
  const { isCriticalLoading, hasMinimumData } = useAppLoadingState();

  // Show loading only for critical loading
  if (isCriticalLoading) {
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

  // If no user or no minimum data, show auth page
  if (!user || !hasMinimumData) {
    return <AuthPage />;
  }

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
