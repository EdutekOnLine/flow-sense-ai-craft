
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AuthPage from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();

  // Always show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Only after loading is complete, decide what to show
  // If not authenticated, show auth page directly
  if (!user || !profile) {
    return <AuthPage />;
  }

  // User is authenticated, show the dashboard
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
