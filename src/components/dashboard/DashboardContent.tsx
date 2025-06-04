
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Workflow, Users, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import WorkflowBuilder from '@/components/workflow-builder/WorkflowBuilder';
import { SavedWorkflows } from './SavedWorkflows';
import { StartableWorkflows } from '@/components/workflow/StartableWorkflows';
import UserManagement from '@/components/admin/UserManagement';

export default function DashboardContent() {
  const { profile } = useAuth();
  const { canCreateWorkflows, canViewWorkflows, userRole } = useWorkflowPermissions();
  const [activeTab, setActiveTab] = useState('overview');

  console.log('=== DASHBOARD CONTENT DEBUG ===');
  console.log('Profile:', profile);
  console.log('User role:', userRole);
  console.log('Can create workflows:', canCreateWorkflows);
  console.log('Can view workflows:', canViewWorkflows);

  const handleCreateWorkflow = () => {
    setActiveTab('builder');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Role: <Badge variant="secondary" className="ml-1 capitalize">{userRole}</Badge>
          </p>
        </div>
        {canCreateWorkflows && (
          <Button onClick={handleCreateWorkflow} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          {canCreateWorkflows && <TabsTrigger value="builder">Workflow Builder</TabsTrigger>}
          {profile?.role === 'admin' && <TabsTrigger value="admin">Administration</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Role-based Quick Actions */}
            {canCreateWorkflows ? (
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCreateWorkflow}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Workflow className="h-5 w-5 text-blue-600" />
                    Create New Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Build and design new workflows for your team.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Workflow className="h-5 w-5 text-green-600" />
                    My Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View and manage your assigned workflow steps.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Coming soon - task assignment system
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Available Workflows */}
            {canViewWorkflows && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Workflow className="h-5 w-5 text-purple-600" />
                    Available Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Browse and start available workflows.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin Panel */}
            {profile?.role === 'admin' && (
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('admin')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-red-600" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Manage users, roles, and permissions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                No recent activity to display
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Saved Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>My Saved Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <SavedWorkflows />
              </CardContent>
            </Card>

            {/* Startable Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>Available to Start</CardTitle>
              </CardHeader>
              <CardContent>
                <StartableWorkflows />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Builder Tab */}
        {canCreateWorkflows && (
          <TabsContent value="builder">
            <WorkflowBuilder />
          </TabsContent>
        )}

        {/* Admin Tab */}
        {profile?.role === 'admin' && (
          <TabsContent value="admin">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
