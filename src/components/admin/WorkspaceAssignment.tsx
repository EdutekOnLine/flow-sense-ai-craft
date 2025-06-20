import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Building2, 
  UserPlus, 
  Plus,
  Crown,
  Shield,
  Briefcase,
  User
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  workspace_id?: string;
  workspace_name?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
}

export default function WorkspaceAssignment() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceSlug, setNewWorkspaceSlug] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');

  // Only root users can access this
  if (profile?.role !== 'root') {
    return (
      <div className="text-center py-8">
        <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Root Access Required</h2>
        <p className="text-muted-foreground">Only root users can manage workspace assignments.</p>
      </div>
    );
  }

  // Fetch all users with workspace info
  const { data: users = [] } = useQuery({
    queryKey: ['users-with-workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          workspace_id,
          workspaces!inner(name)
        `)
        .order('role', { ascending: true })
        .order('email', { ascending: true });
      
      if (error) throw error;
      
      return data.map(user => ({
        ...user,
        workspace_name: user.workspaces?.name || null
      })) as User[];
    },
  });

  // Fetch all workspaces
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Workspace[];
    },
  });

  // Create new workspace
  const createWorkspace = useMutation({
    mutationFn: async (workspaceData: { name: string; slug: string; description?: string }) => {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          name: workspaceData.name,
          slug: workspaceData.slug,
          description: workspaceData.description,
          owner_id: profile!.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Workspace Created',
        description: 'New workspace has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setNewWorkspaceName('');
      setNewWorkspaceSlug('');
      setNewWorkspaceDescription('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Assign user to workspace
  const assignToWorkspace = useMutation({
    mutationFn: async ({ userId, workspaceId }: { userId: string; workspaceId: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ workspace_id: workspaceId })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'User Assigned',
        description: 'User has been assigned to workspace successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['users-with-workspaces'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'root': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'manager': return <Briefcase className="h-4 w-4 text-green-500" />;
      case 'employee': return <User className="h-4 w-4 text-gray-500" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'root': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'manager': return 'bg-green-100 text-green-800 border-green-300';
      case 'employee': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const unassignedUsers = users.filter(user => !user.workspace_id && user.role !== 'root');
  const assignedUsers = users.filter(user => user.workspace_id);
  const rootUsers = users.filter(user => user.role === 'root');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Workspace Assignment</h1>
                <p className="text-muted-foreground">Manage user workspace assignments and create new workspaces</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Users className="h-3 w-3 mr-1" />
                {users.length} Total Users
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                <UserPlus className="h-3 w-3 mr-1" />
                {unassignedUsers.length} Unassigned
              </Badge>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Crown className="h-3 w-3 mr-1" />
            Root Access
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Workspace */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g., Marketing Team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Workspace Slug</Label>
              <Input
                id="workspace-slug"
                value={newWorkspaceSlug}
                onChange={(e) => setNewWorkspaceSlug(e.target.value)}
                placeholder="e.g., marketing-team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">Description (Optional)</Label>
              <Input
                id="workspace-description"
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                placeholder="Brief description of the workspace"
              />
            </div>
            <Button 
              onClick={() => createWorkspace.mutate({
                name: newWorkspaceName,
                slug: newWorkspaceSlug,
                description: newWorkspaceDescription
              })}
              disabled={!newWorkspaceName || !newWorkspaceSlug || createWorkspace.isPending}
              className="w-full"
            >
              {createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Existing Workspaces ({workspaces.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{workspace.name}</h4>
                    <p className="text-sm text-muted-foreground">{workspace.slug}</p>
                    {workspace.description && (
                      <p className="text-xs text-muted-foreground mt-1">{workspace.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {assignedUsers.filter(u => u.workspace_id === workspace.id).length} users
                  </Badge>
                </div>
              ))}
              {workspaces.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No workspaces created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Users */}
      {unassignedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <UserPlus className="h-5 w-5" />
              Unassigned Users ({unassignedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unassignedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(user.role)}
                    <div>
                      <p className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedWorkspace}
                      onValueChange={setSelectedWorkspace}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedWorkspace) {
                          assignToWorkspace.mutate({
                            userId: user.id,
                            workspaceId: selectedWorkspace
                          });
                        }
                      }}
                      disabled={!selectedWorkspace || assignToWorkspace.isPending}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Root Users */}
      {rootUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Crown className="h-5 w-5" />
              Root Users ({rootUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rootUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Root User
                    </Badge>
                  </div>
                  <Badge variant="secondary">
                    Platform-wide Access
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Users by Workspace */}
      {workspaces.map((workspace) => {
        const workspaceUsers = assignedUsers.filter(u => u.workspace_id === workspace.id);
        if (workspaceUsers.length === 0) return null;

        return (
          <Card key={workspace.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {workspace.name} ({workspaceUsers.length} users)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workspaceUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(user.role)}
                      <div>
                        <p className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        assignToWorkspace.mutate({
                          userId: user.id,
                          workspaceId: ''
                        });
                      }}
                      disabled={assignToWorkspace.isPending}
                    >
                      Remove from Workspace
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
