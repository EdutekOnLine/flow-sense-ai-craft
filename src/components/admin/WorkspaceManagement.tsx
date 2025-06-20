
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
import { Building, Plus, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  user_count?: number;
}

export default function WorkspaceManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    slug: '',
    description: ''
  });

  // Only root users can access this
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

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          profiles!profiles_workspace_id_fkey(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(workspace => ({
        ...workspace,
        user_count: workspace.profiles?.length || 0
      })) as Workspace[];
    },
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
