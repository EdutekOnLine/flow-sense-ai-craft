
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

      // Debug: Check what data exists before cleanup
      console.log('=== DEBUGGING DATA BEFORE CLEANUP ===');
      
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('id, workflow_step_id');
      console.log('All notifications:', allNotifications);

      const { data: allWorkflowSteps } = await supabase
        .from('workflow_steps')
        .select('id, workflow_id');
      console.log('All workflow steps:', allWorkflowSteps);

      const { data: allWorkflows } = await supabase
        .from('workflows')
        .select('id, name');
      console.log('All workflows:', allWorkflows);

      // Check which notifications reference workflow steps
      if (allNotifications && allWorkflowSteps) {
        const notificationsWithStepRefs = allNotifications.filter(n => n.workflow_step_id);
        console.log('Notifications with workflow_step_id references:', notificationsWithStepRefs);
        
        const stepIds = allWorkflowSteps.map(s => s.id);
        const orphanedNotifications = notificationsWithStepRefs.filter(n => 
          n.workflow_step_id && !stepIds.includes(n.workflow_step_id)
        );
        console.log('Orphaned notifications (referencing non-existent steps):', orphanedNotifications);
      }

      console.log('=== STARTING CLEANUP PROCESS ===');

      // Step 1: Delete ALL notifications first (including those with workflow_step_id references)
      console.log('Deleting all notifications...');
      const { error: notificationsDeleteError, count: notificationsCount } = await supabase
        .from('notifications')
        .delete()
        .not('id', 'is', null);

      if (notificationsDeleteError) {
        console.error('Error deleting notifications:', notificationsDeleteError);
        throw notificationsDeleteError;
      }
      console.log(`Deleted ${notificationsCount || 0} notifications`);

      // Debug: Verify notifications are gone
      const { data: remainingNotifications } = await supabase
        .from('notifications')
        .select('id, workflow_step_id');
      console.log('Remaining notifications after deletion:', remainingNotifications);

      // Step 2: Delete workflow step assignments
      console.log('Deleting workflow step assignments...');
      const { error: assignmentsDeleteError, count: assignmentsCount } = await supabase
        .from('workflow_step_assignments')
        .delete()
        .not('id', 'is', null);

      if (assignmentsDeleteError) {
        console.error('Error deleting assignments:', assignmentsDeleteError);
        throw assignmentsDeleteError;
      }
      console.log(`Deleted ${assignmentsCount || 0} assignments`);

      // Step 3: Delete workflow comments
      console.log('Deleting workflow comments...');
      const { error: commentsDeleteError, count: commentsCount } = await supabase
        .from('workflow_comments')
        .delete()
        .not('id', 'is', null);

      if (commentsDeleteError) {
        console.error('Error deleting comments:', commentsDeleteError);
        throw commentsDeleteError;
      }
      console.log(`Deleted ${commentsCount || 0} comments`);

      // Step 4: Delete workflow instances
      console.log('Deleting workflow instances...');
      const { error: instancesDeleteError, count: instancesCount } = await supabase
        .from('workflow_instances')
        .delete()
        .not('id', 'is', null);

      if (instancesDeleteError) {
        console.error('Error deleting instances:', instancesDeleteError);
        throw instancesDeleteError;
      }
      console.log(`Deleted ${instancesCount || 0} instances`);

      // Step 5: Delete workflow steps
      console.log('Deleting workflow steps...');
      
      // Debug: Check notifications again before deleting steps
      const { data: notificationsBeforeStepsDelete } = await supabase
        .from('notifications')
        .select('id, workflow_step_id');
      console.log('Notifications before deleting steps:', notificationsBeforeStepsDelete);

      const { error: stepsDeleteError, count: stepsCount } = await supabase
        .from('workflow_steps')
        .delete()
        .not('id', 'is', null);

      if (stepsDeleteError) {
        console.error('Error deleting steps:', stepsDeleteError);
        throw stepsDeleteError;
      }
      console.log(`Deleted ${stepsCount || 0} steps`);

      // Step 6: Finally delete workflows
      console.log('Deleting workflows...');
      
      // Debug: Final check for any remaining references
      const { data: finalNotifications } = await supabase
        .from('notifications')
        .select('id, workflow_step_id');
      console.log('Final notifications check before deleting workflows:', finalNotifications);

      const { error: workflowsDeleteError, count: workflowsCount } = await supabase
        .from('workflows')
        .delete()
        .not('id', 'is', null);

      if (workflowsDeleteError) {
        console.error('Error deleting workflows:', workflowsDeleteError);
        throw workflowsDeleteError;
      }
      console.log(`Deleted ${workflowsCount || 0} workflows`);

      console.log('Data cleanup completed successfully');
      toast.success('All workflow data has been cleaned up successfully!');
      
      // Refresh the page to reflect changes
      window.location.reload();
      
    } catch (error) {
      console.error('Error during cleanup:', error);
      console.log('=== DEBUGGING DATA AFTER ERROR ===');
      
      // Debug: Check what data remains after error
      try {
        const { data: remainingNotifications } = await supabase
          .from('notifications')
          .select('id, workflow_step_id');
        console.log('Remaining notifications after error:', remainingNotifications);

        const { data: remainingSteps } = await supabase
          .from('workflow_steps')
          .select('id');
        console.log('Remaining workflow steps after error:', remainingSteps);

        const { data: remainingWorkflows } = await supabase
          .from('workflows')
          .select('id');
        console.log('Remaining workflows after error:', remainingWorkflows);
      } catch (debugError) {
        console.error('Error during debug queries:', debugError);
      }
      
      toast.error('Failed to clean up data. Please check the console for details.');
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
