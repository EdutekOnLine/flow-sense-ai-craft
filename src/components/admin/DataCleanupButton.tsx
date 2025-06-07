
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function DataCleanupButton() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Only show for admins
  if (profile?.role !== 'admin') {
    return null;
  }

  const handleCleanup = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting data cleanup...');

      // Step 1: Delete ALL notifications first (they reference other tables)
      console.log('Deleting all notifications...');
      
      // First, get all notification IDs
      const { data: notifications, error: notificationsFetchError } = await supabase
        .from('notifications')
        .select('id');

      if (notificationsFetchError) {
        console.error('Error fetching notifications:', notificationsFetchError);
        throw notificationsFetchError;
      }

      // Delete all notifications if any exist
      if (notifications && notifications.length > 0) {
        const notificationIds = notifications.map(n => n.id);
        const { error: notificationsDeleteError } = await supabase
          .from('notifications')
          .delete()
          .in('id', notificationIds);

        if (notificationsDeleteError) {
          console.error('Error deleting notifications:', notificationsDeleteError);
          throw notificationsDeleteError;
        }
        console.log(`Deleted ${notifications.length} notifications`);
      } else {
        console.log('No notifications to delete');
      }

      // Step 2: Delete workflow step assignments (they reference workflow_steps)
      console.log('Deleting workflow step assignments...');
      const { data: assignments, error: assignmentsFetchError } = await supabase
        .from('workflow_step_assignments')
        .select('id');

      if (assignmentsFetchError) {
        console.error('Error fetching assignments:', assignmentsFetchError);
        throw assignmentsFetchError;
      }

      if (assignments && assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        const { error: assignmentsDeleteError } = await supabase
          .from('workflow_step_assignments')
          .delete()
          .in('id', assignmentIds);

        if (assignmentsDeleteError) {
          console.error('Error deleting assignments:', assignmentsDeleteError);
          throw assignmentsDeleteError;
        }
        console.log(`Deleted ${assignments.length} assignments`);
      }

      // Step 3: Delete workflow comments (they reference workflows)
      console.log('Deleting workflow comments...');
      const { data: comments, error: commentsFetchError } = await supabase
        .from('workflow_comments')
        .select('id');

      if (commentsFetchError) {
        console.error('Error fetching comments:', commentsFetchError);
        throw commentsFetchError;
      }

      if (comments && comments.length > 0) {
        const commentIds = comments.map(c => c.id);
        const { error: commentsDeleteError } = await supabase
          .from('workflow_comments')
          .delete()
          .in('id', commentIds);

        if (commentsDeleteError) {
          console.error('Error deleting comments:', commentsDeleteError);
          throw commentsDeleteError;
        }
        console.log(`Deleted ${comments.length} comments`);
      }

      // Step 4: Delete workflow instances (they reference workflows and workflow_steps)
      console.log('Deleting workflow instances...');
      const { data: instances, error: instancesFetchError } = await supabase
        .from('workflow_instances')
        .select('id');

      if (instancesFetchError) {
        console.error('Error fetching instances:', instancesFetchError);
        throw instancesFetchError;
      }

      if (instances && instances.length > 0) {
        const instanceIds = instances.map(i => i.id);
        const { error: instancesDeleteError } = await supabase
          .from('workflow_instances')
          .delete()
          .in('id', instanceIds);

        if (instancesDeleteError) {
          console.error('Error deleting instances:', instancesDeleteError);
          throw instancesDeleteError;
        }
        console.log(`Deleted ${instances.length} instances`);
      }

      // Step 5: Delete workflow steps (they reference workflows)
      console.log('Deleting workflow steps...');
      const { data: steps, error: stepsFetchError } = await supabase
        .from('workflow_steps')
        .select('id');

      if (stepsFetchError) {
        console.error('Error fetching steps:', stepsFetchError);
        throw stepsFetchError;
      }

      if (steps && steps.length > 0) {
        const stepIds = steps.map(s => s.id);
        const { error: stepsDeleteError } = await supabase
          .from('workflow_steps')
          .delete()
          .in('id', stepIds);

        if (stepsDeleteError) {
          console.error('Error deleting steps:', stepsDeleteError);
          throw stepsDeleteError;
        }
        console.log(`Deleted ${steps.length} steps`);
      }

      // Step 6: Finally delete workflows (main table)
      console.log('Deleting workflows...');
      const { data: workflows, error: workflowsFetchError } = await supabase
        .from('workflows')
        .select('id');

      if (workflowsFetchError) {
        console.error('Error fetching workflows:', workflowsFetchError);
        throw workflowsFetchError;
      }

      if (workflows && workflows.length > 0) {
        const workflowIds = workflows.map(w => w.id);
        const { error: workflowsDeleteError } = await supabase
          .from('workflows')
          .delete()
          .in('id', workflowIds);

        if (workflowsDeleteError) {
          console.error('Error deleting workflows:', workflowsDeleteError);
          throw workflowsDeleteError;
        }
        console.log(`Deleted ${workflows.length} workflows`);
      }

      console.log('Data cleanup completed successfully');
      toast.success('All workflow data has been cleaned up successfully!');
      
      // Refresh the page to reflect changes
      window.location.reload();
      
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast.error('Failed to clean up data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Clean Up All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete:
            <br />
            <br />
            • All workflow instances
            <br />
            • All workflow steps and assignments
            <br />
            • All workflow comments and notifications
            <br />
            • All active workflows
            <br />
            <br />
            Your saved workflow templates will be preserved and can be used to create new workflows.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCleanup}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cleaning...
              </>
            ) : (
              'Yes, clean up all data'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
