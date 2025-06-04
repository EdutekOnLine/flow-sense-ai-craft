
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
  console.log('Dashboard page - Timestamp:', new Date().toISOString());
  console.log('Dashboard page - Will show:', 
    loading ? 'Loading spinner' : 
    (!user ? 'AuthPage (no user)' : 
    (!profile ? 'AuthPage (no profile)' : 'DashboardContent')));

  if (loading) {
    console.log('Dashboard showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-lg font-medium">Loading Dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching user profile</div>
        </div>
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

  console.log('Dashboard showing main content with profile:', profile.role);
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
