
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
      const { error: notificationsError } = await supabase
        .from('notifications')
        .delete()
        .not('id', 'is', null);

      if (notificationsError) {
        console.error('Error deleting notifications:', notificationsError);
        throw notificationsError;
      }

      // Step 2: Delete workflow step assignments (they reference workflow_steps)
      console.log('Deleting workflow step assignments...');
      const { error: assignmentsError } = await supabase
        .from('workflow_step_assignments')
        .delete()
        .not('id', 'is', null);

      if (assignmentsError) {
        console.error('Error deleting assignments:', assignmentsError);
        throw assignmentsError;
      }

      // Step 3: Delete workflow comments (they reference workflows)
      console.log('Deleting workflow comments...');
      const { error: commentsError } = await supabase
        .from('workflow_comments')
        .delete()
        .not('id', 'is', null);

      if (commentsError) {
        console.error('Error deleting comments:', commentsError);
        throw commentsError;
      }

      // Step 4: Delete workflow instances (they reference workflows and workflow_steps)
      console.log('Deleting workflow instances...');
      const { error: instancesError } = await supabase
        .from('workflow_instances')
        .delete()
        .not('id', 'is', null);

      if (instancesError) {
        console.error('Error deleting instances:', instancesError);
        throw instancesError;
      }

      // Step 5: Delete workflow steps (they reference workflows)
      console.log('Deleting workflow steps...');
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .delete()
        .not('id', 'is', null);

      if (stepsError) {
        console.error('Error deleting steps:', stepsError);
        throw stepsError;
      }

      // Step 6: Finally delete workflows (main table)
      console.log('Deleting workflows...');
      const { error: workflowsError } = await supabase
        .from('workflows')
        .delete()
        .not('id', 'is', null);

      if (workflowsError) {
        console.error('Error deleting workflows:', workflowsError);
        throw workflowsError;
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
