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

      // Clean up in the correct order to avoid foreign key constraints
      const cleanupQueries = [
        // Delete workflow step assignments first
        supabase.from('workflow_step_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        
        // Delete workflow instances
        supabase.from('workflow_instances').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        
        // Delete workflow comments
        supabase.from('workflow_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        
        // Delete workflow steps
        supabase.from('workflow_steps').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        
        // Delete workflows (but keep saved workflows and templates)
        supabase.from('workflows').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        
        // Clean up workflow-related notifications
        supabase.from('notifications').delete().not('workflow_step_id', 'is', null),
      ];

      // Execute all cleanup queries
      for (const query of cleanupQueries) {
        const { error } = await query;
        if (error) {
          console.error('Cleanup error:', error);
          throw error;
        }
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
