
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface UserWithWorkspace {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  department?: string;
  workspace_id?: string;
  workspace_name?: string;
  workspace_slug?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  user_count?: number;
}

interface WorkspaceStatisticsProps {
  users: UserWithWorkspace[];
  workspaces: Workspace[];
}

export function WorkspaceStatistics({ users, workspaces }: WorkspaceStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Platform Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{workspaces.length}</div>
            <div className="text-sm text-muted-foreground">Workspaces</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {users.filter(u => u.workspace_id).length}
            </div>
            <div className="text-sm text-muted-foreground">Assigned Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {users.filter(u => !u.workspace_id && u.role !== 'root').length}
            </div>
            <div className="text-sm text-muted-foreground">Unassigned Users</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
