
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReportsContent from '@/components/reports/ReportsContent';
import AuthPage from '@/components/auth/AuthPage';
import { Loader2 } from 'lucide-react';

export default function Reports() {
  const { user, profile, loading } = useAuth();

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

  return (
    <DashboardLayout>
      <ReportsContent />
    </DashboardLayout>
  );
}
