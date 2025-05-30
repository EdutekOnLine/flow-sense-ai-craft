import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Workflow, 
  Settings, 
  LogOut, 
  FileText,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import DashboardContent from '@/components/dashboard/DashboardContent';
import WorkflowTabs from '@/components/workflows/WorkflowTabs';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check URL hash for active tab
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveTab(hash);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'workflows', label: 'Workflows', icon: Workflow, roles: ['admin', 'manager', 'employee'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin', 'manager'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'templates', label: 'Templates', icon: FileText, roles: ['admin', 'manager', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const visibleNavItems = navigationItems.filter(item => 
    item.roles.includes(profile?.role || 'employee')
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return profile?.role === 'admin' ? <UserManagement /> : <DashboardContent />;
      case 'workflows':
        return <WorkflowTabs />;
      case 'reports':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
            <p className="text-gray-600">Analytics and reporting functionality coming soon...</p>
          </div>
        );
      case 'templates':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Templates</h2>
            <p className="text-gray-600">Workflow templates functionality coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">System settings functionality coming soon...</p>
          </div>
        );
      default:
        return children || <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Workflow className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">NeuraFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.first_name || profile?.email}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {profile?.role?.toUpperCase()}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
