
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { WorkspaceSelector } from '@/components/admin/WorkspaceSelector';
import { useAuth } from '@/hooks/useAuth';

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name too long'),
  description: z.string().optional(),
  workspace_id: z.string().optional(),
  manager_id: z.string().min(1, 'Manager selection is required'),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { profile } = useAuth();
  const { 
    createTeam, 
    availableManagers,
    workspaceUsers,
    isCreating,
    isRootUser
  } = useTeamManagement();

  const form = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      workspace_id: isRootUser ? '' : profile?.workspace_id || '',
      manager_id: '',
    },
  });

  const watchedWorkspaceId = form.watch('workspace_id');
  
  // Filter managers based on selected workspace for root users, or use available managers for regular users
  const filteredManagers = isRootUser && watchedWorkspaceId
    ? workspaceUsers.filter(user => 
        user.workspace_id === watchedWorkspaceId && user.role === 'manager'
      )
    : availableManagers;

  // Reset manager selection when workspace changes
  useEffect(() => {
    if (isRootUser && watchedWorkspaceId) {
      form.setValue('manager_id', '');
    }
  }, [watchedWorkspaceId, isRootUser, form]);

  const onSubmit = async (data: CreateTeamForm) => {
    // Determine the target workspace
    const targetWorkspaceId = isRootUser ? data.workspace_id : profile?.workspace_id;
    
    if (data.name && data.manager_id && targetWorkspaceId) {
      createTeam({
        name: data.name,
        description: data.description || '',
        manager_id: data.manager_id,
        workspace_id: targetWorkspaceId,
      });
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isRootUser && (
              <FormField
                control={form.control}
                name="workspace_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Workspace</FormLabel>
                    <FormControl>
                      <WorkspaceSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the team's purpose"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Manager</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isRootUser && !watchedWorkspaceId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isRootUser && !watchedWorkspaceId 
                            ? "Select a workspace first" 
                            : "Select a manager"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.first_name} {manager.last_name} ({manager.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
