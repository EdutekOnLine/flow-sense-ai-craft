import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Plus, Users, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  user_count?: number;
}

interface WorkspaceUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}

export default function WorkspaceManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [reassignmentAction, setReassignmentAction] = useState<'reassign' | 'delete'>('reassign');
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    slug: '',
    description: ''
  });

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

  // Merge workspaces with user counts
  const workspaces = rawWorkspaces.map(workspace => ({
    ...workspace,
    user_count: userCounts[workspace.id] || 0
  }));

  const isLoading = workspacesLoading || userCountsLoading;

  // Get users for workspace being deleted
  const { data: workspaceUsers = [] } = useQuery({
    queryKey: ['workspace-users', deletingWorkspace?.id],
    queryFn: async () => {
      if (!deletingWorkspace?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .eq('workspace_id', deletingWorkspace.id);
      
      if (error) throw error;
      return data as WorkspaceUser[];
    },
    enabled: !!deletingWorkspace?.id,
  });

  const createWorkspace = useMutation({
    mutationFn: async (workspace: { name: string; slug: string; description: string }) => {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          ...workspace,
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
        description: 'The workspace has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-user-counts'] });
      setIsCreateDialogOpen(false);
      setNewWorkspace({ name: '', slug: '', description: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Creating Workspace',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteWorkspace = useMutation({
    mutationFn: async ({ workspace, action, targetId }: { 
      workspace: Workspace; 
      action: 'reassign' | 'delete';
      targetId?: string;
    }) => {
      // Handle user reassignment or deletion
      if (workspace.user_count && workspace.user_count > 0) {
        if (action === 'reassign' && targetId) {
          // Reassign users to target workspace
          const { error: reassignError } = await supabase
            .from('profiles')
            .update({ workspace_id: targetId })
            .eq('workspace_id', workspace.id);
          
          if (reassignError) throw reassignError;
        } else if (action === 'delete') {
          // Delete users (this will cascade to related data)
          const { error: deleteUsersError } = await supabase
            .from('profiles')
            .delete()
            .eq('workspace_id', workspace.id);
          
          if (deleteUsersError) throw deleteUsersError;
        }
      }

      // Clean up workspace-related data
      await Promise.all([
        supabase.from('workspace_modules').delete().eq('workspace_id', workspace.id),
        supabase.from('module_audit_logs').delete().eq('workspace_id', workspace.id),
        supabase.from('user_invitations').delete().eq('workspace_id', workspace.id)
      ]);

      // Finally delete the workspace
      const { error: deleteWorkspaceError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspace.id);
      
      if (deleteWorkspaceError) throw deleteWorkspaceError;
      
      return workspace;
    },
    onSuccess: (workspace) => {
      toast({
        title: 'Workspace Deleted',
        description: `${workspace.name} has been deleted successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-user-counts'] });
      setDeletingWorkspace(null);
      setConfirmText('');
      setReassignmentAction('reassign');
      setTargetWorkspaceId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Workspace',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Now check role after all hooks are declared
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

  const handleCreateWorkspace = () => {
    if (!newWorkspace.name || !newWorkspace.slug) {
      toast({
        title: 'Validation Error',
        description: 'Name and slug are required.',
        variant: 'destructive',
      });
      return;
    }

    createWorkspace.mutate(newWorkspace);
  };

  const handleDeleteWorkspace = () => {
    if (!deletingWorkspace) return;
    
    if (confirmText !== deletingWorkspace.name) {
      toast({
        title: 'Confirmation Required',
        description: 'Please type the workspace name exactly to confirm deletion.',
        variant: 'destructive',
      });
      return;
    }

    if (reassignmentAction === 'reassign' && !targetWorkspaceId) {
      toast({
        title: 'Target Workspace Required',
        description: 'Please select a target workspace for user reassignment.',
        variant: 'destructive',
      });
      return;
    }

    deleteWorkspace.mutate({
      workspace: deletingWorkspace,
      action: reassignmentAction,
      targetId: targetWorkspaceId
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewWorkspace(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  const getDisplayName = (user: WorkspaceUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  const availableWorkspaces = workspaces.filter(w => w.id !== deletingWorkspace?.id);

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
            Create and manage workspaces across the platform
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace for an organization to manage their workflows and users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  value={newWorkspace.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter workspace name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={newWorkspace.slug}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="workspace-slug"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newWorkspace.description}
                  onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the workspace"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkspace} disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {workspaces.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Workspaces</h3>
              <p className="text-muted-foreground mb-4">
                Create your first workspace to get started with managing organizations.
              </p>
            </CardContent>
          </Card>
        ) : (
          workspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{workspace.name}</h3>
                      <Badge variant="secondary">{workspace.slug}</Badge>
                    </div>
                    {workspace.description && (
                      <p className="text-muted-foreground mb-3">{workspace.description}</p>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {workspace.user_count} users
                      <span className="mx-2">•</span>
                      Created {new Date(workspace.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingWorkspace(workspace)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete Workspace: {workspace.name}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-4">
                            <p>
                              This action cannot be undone. This will permanently delete the workspace
                              and all associated data.
                            </p>
                            
                            {workspace.user_count && workspace.user_count > 0 && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h4 className="font-medium text-orange-900 mb-2">
                                  This workspace has {workspace.user_count} users:
                                </h4>
                                <div className="space-y-1 mb-4">
                                  {workspaceUsers.slice(0, 5).map(user => (
                                    <div key={user.id} className="text-sm text-orange-800">
                                      • {getDisplayName(user)} ({user.role})
                                    </div>
                                  ))}
                                  {workspaceUsers.length > 5 && (
                                    <div className="text-sm text-orange-800">
                                      • ... and {workspaceUsers.length - 5} more users
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-3">
                                  <Label>What should happen to these users?</Label>
                                  <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        value="reassign"
                                        checked={reassignmentAction === 'reassign'}
                                        onChange={(e) => setReassignmentAction(e.target.value as 'reassign')}
                                      />
                                      <span className="text-sm">Reassign users to another workspace</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        value="delete"
                                        checked={reassignmentAction === 'delete'}
                                        onChange={(e) => setReassignmentAction(e.target.value as 'delete')}
                                      />
                                      <span className="text-sm text-destructive">Delete all users</span>
                                    </label>
                                  </div>
                                  
                                  {reassignmentAction === 'reassign' && (
                                    <div>
                                      <Label>Target Workspace</Label>
                                      <Select value={targetWorkspaceId} onValueChange={setTargetWorkspaceId}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select workspace" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableWorkspaces.map(w => (
                                            <SelectItem key={w.id} value={w.id}>
                                              {w.name} ({w.user_count} users)
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <Label>Type the workspace name "{workspace.name}" to confirm:</Label>
                              <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={workspace.name}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setDeletingWorkspace(null);
                          setConfirmText('');
                          setReassignmentAction('reassign');
                          setTargetWorkspaceId('');
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteWorkspace}
                          disabled={deleteWorkspace.isPending || confirmText !== workspace.name}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteWorkspace.isPending ? 'Deleting...' : 'Delete Workspace'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
