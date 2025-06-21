
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, UserCog } from 'lucide-react';

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

interface UserAssignmentProps {
  users: UserWithWorkspace[];
  workspaces: Workspace[];
}

export function UserAssignment({ users, workspaces }: UserAssignmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');

  // Mutation to update user workspace
  const updateUserWorkspace = useMutation({
    mutationFn: async ({ userId, workspaceId }: { userId: string; workspaceId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ workspace_id: workspaceId })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Workspace Updated',
        description: 'User workspace assignment has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['all-users-with-workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-user-counts'] });
      setSelectedUserId('');
      setSelectedWorkspaceId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user workspace.',
        variant: 'destructive',
      });
    },
  });

  const handleAssignWorkspace = () => {
    if (!selectedUserId || !selectedWorkspaceId) return;
    
    updateUserWorkspace.mutate({
      userId: selectedUserId,
      workspaceId: selectedWorkspaceId === 'none' ? null : selectedWorkspaceId
    });
  };

  const handleRemoveFromWorkspace = (userId: string) => {
    updateUserWorkspace.mutate({
      userId,
      workspaceId: null
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'root': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group users by workspace
  const groupedUsers = users.reduce((acc, user) => {
    const workspaceKey = user.workspace_id || 'unassigned';
    const workspaceName = user.workspace_name || 'Unassigned Users';
    
    if (!acc[workspaceKey]) {
      acc[workspaceKey] = {
        name: workspaceName,
        users: []
      };
    }
    acc[workspaceKey].users.push(user);
    return acc;
  }, {} as Record<string, { name: string; users: UserWithWorkspace[] }>);

  return (
    <div className="space-y-4">
      {/* Quick Assignment Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Quick Assignment
          </CardTitle>
          <CardDescription>
            Assign a user to a workspace quickly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.role !== 'root').map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name} (${user.email})`
                        : user.email
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select Workspace</label>
              <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workspace..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Remove from workspace</SelectItem>
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAssignWorkspace}
                disabled={!selectedUserId || !selectedWorkspaceId || updateUserWorkspace.isPending}
                className="w-full"
              >
                {updateUserWorkspace.isPending ? 'Updating...' : 'Assign'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users by Workspace */}
      <div className="space-y-4">
        {Object.entries(groupedUsers).map(([workspaceKey, group]) => (
          <Card key={workspaceKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {group.name}
                <Badge variant="secondary" className="ml-2">
                  {group.users.length} users
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                          {user.department && ` • ${user.department}`}
                        </div>
                      </div>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    
                    {user.role !== 'root' && user.workspace_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWorkspace(user.id)}
                        disabled={updateUserWorkspace.isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
