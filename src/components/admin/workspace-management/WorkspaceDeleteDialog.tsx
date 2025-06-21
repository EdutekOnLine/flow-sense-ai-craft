
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, AlertTriangle } from 'lucide-react';
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

interface WorkspaceDeleteDialogProps {
  workspace: Workspace;
  availableWorkspaces: Workspace[];
}

export function WorkspaceDeleteDialog({ workspace, availableWorkspaces }: WorkspaceDeleteDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');
  const [reassignmentAction, setReassignmentAction] = useState<'reassign' | 'delete'>('reassign');
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');

  // Get users for workspace being deleted
  const { data: workspaceUsers = [] } = useQuery({
    queryKey: ['workspace-users', workspace.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .eq('workspace_id', workspace.id);
      
      if (error) throw error;
      return data as WorkspaceUser[];
    },
    enabled: !!workspace.id,
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
      queryClient.invalidateQueries({ queryKey: ['all-users-with-workspaces'] });
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

  const handleDeleteWorkspace = () => {
    if (confirmText !== workspace.name) {
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
      workspace,
      action: reassignmentAction,
      targetId: targetWorkspaceId
    });
  };

  const getDisplayName = (user: WorkspaceUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:text-destructive"
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
  );
}
