
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface StepStatusManagerProps {
  stepId: string;
  currentStatus: string;
  workflowId: string;
}

export default function StepStatusManager({ stepId, currentStatus, workflowId }: StepStatusManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStepStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('workflow_steps')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
      toast({
        title: "Success",
        description: "Step status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update step status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      updateStepStatusMutation.mutate(newStatus);
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={updateStepStatusMutation.isPending}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="blocked">Blocked</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}
