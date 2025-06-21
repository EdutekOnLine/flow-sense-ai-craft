
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateWorkspaceDialog } from './workspace-management/CreateWorkspaceDialog';
import { WorkspaceList } from './workspace-management/WorkspaceList';
import { UserAssignment } from './workspace-management/UserAssignment';
import { WorkspaceStatistics } from './workspace-management/WorkspaceStatistics';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  user_count?: number;
}

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

export default function WorkspaceManagement() {
  const { profile } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch workspaces
  const { data: rawWorkspaces = [], isLoading: workspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'root',
  });

  // Fetch user counts per workspace
  const { data: userCounts = [], isLoading: userCountsLoading } = useQuery({
    queryKey: ['workspace-user-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('workspace_id')
        .not('workspace_id', 'is', null);
      
      if (error) throw error;
      
      // Count users per workspace
      const counts: Record<string, number> = {};
      data.forEach(profile => {
        if (profile.workspace_id) {
          counts[profile.workspace_id] = (counts[profile.workspace_id] || 0) + 1;
        }
      });
      
      return counts;
    },
    enabled: profile?.role === 'root',
  });

  // Fetch all users with their workspace information
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users-with-workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          department,
          workspace_id,
          workspaces:workspace_id (
            name,
            slug
          )
        `)
        .order('role', { ascending: false })
        .order('email', { ascending: true });

      if (error) throw error;
      
      return data.map(user => ({
        ...user,
        workspace_name: user.workspaces?.name,
        workspace_slug: user.workspaces?.slug
      })) as UserWithWorkspace[];
    },
    enabled: profile?.role === 'root',
  });

  // Merge workspaces with user counts
  const workspaces = rawWorkspaces.map(workspace => ({
    ...workspace,
    user_count: userCounts[workspace.id] || 0
  }));

  const isLoading = workspacesLoading || userCountsLoading || usersLoading;

  // Check role after all hooks are declared
  if (profile?.role !== 'root') {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only root users can manage workspaces.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            Workspace Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and assign users to workspaces across the platform
          </p>
        </div>
        
        <CreateWorkspaceDialog 
          isOpen={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </div>

      <Tabs defaultValue="workspaces" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces" className="space-y-4">
          <WorkspaceList workspaces={workspaces} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <UserAssignment users={users} workspaces={workspaces} />
        </TabsContent>

        <TabsContent value="statistics">
          <WorkspaceStatistics users={users} workspaces={workspaces} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
