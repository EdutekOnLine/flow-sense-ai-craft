
import React from 'react';
import { useRootPermissions } from '@/hooks/useRootPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Database, Users, Building2, Workflow, BarChart } from 'lucide-react';

export function RootSystemOverview() {
  const { isRootUser } = useRootPermissions();

  if (!isRootUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="h-6 w-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-900">System Administration</h2>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Root Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              System-Wide Access
            </CardTitle>
            <Database className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">Unlimited</div>
            <p className="text-xs text-amber-700">
              Access to all workspaces and data
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              User Management
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">All Users</div>
            <p className="text-xs text-blue-700">
              Manage users across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Workspace Control
            </CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">Full Control</div>
            <p className="text-xs text-green-700">
              Create, edit, delete any workspace
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Workflow Management
            </CardTitle>
            <Workflow className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">All Workflows</div>
            <p className="text-xs text-purple-700">
              Manage workflows across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">
              System Analytics
            </CardTitle>
            <BarChart className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">Global Metrics</div>
            <p className="text-xs text-indigo-700">
              View system-wide performance data
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-800">
              Module Management
            </CardTitle>
            <Database className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">All Modules</div>
            <p className="text-xs text-rose-700">
              Activate/deactivate across workspaces
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
