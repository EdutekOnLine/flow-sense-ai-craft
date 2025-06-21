
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ isOpen, onOpenChange }: CreateWorkspaceDialogProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    slug: '',
    description: ''
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
      queryClient.invalidateQueries({ queryKey: ['all-users-with-workspaces'] });
      onOpenChange(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
