
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import AuthPage from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, loading, isRootUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  // Root users bypass workspace requirements
  if (isRootUser()) {
    console.log('Root user detected, granting full access');
    return (
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    );
  }

  // Regular users need workspace validation
  if (!profile.workspace_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">No Workspace Assigned</h2>
          <p className="text-muted-foreground">Contact your administrator to be assigned to a workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
