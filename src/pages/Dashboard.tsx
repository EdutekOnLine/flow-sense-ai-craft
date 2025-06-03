
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AuthPage from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();

  console.log('=== DASHBOARD PAGE DEBUG ===');
  console.log('Dashboard page - User:', user?.id);
  console.log('Dashboard page - Profile:', profile?.id);
  console.log('Dashboard page - Loading:', loading);
  console.log('Dashboard page - Will show:', 
    loading ? 'Loading spinner' : 
    (!user ? 'AuthPage (no user)' : 
    (!profile ? 'AuthPage (no profile)' : 'DashboardContent')));

  if (loading) {
    console.log('Dashboard showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    console.log('Dashboard redirecting to auth - no user');
    return <AuthPage />;
  }

  if (!profile) {
    console.log('Dashboard redirecting to auth - no profile');
    return <AuthPage />;
  }

  console.log('Dashboard showing main content');
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
