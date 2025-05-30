
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowList from './WorkflowList';
import WorkflowCreation from './WorkflowCreation';
import VisualWorkflowBuilder from './VisualWorkflowBuilder';
import { Plus, List, Workflow } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function WorkflowTabs() {
  const [activeTab, setActiveTab] = useState('list');
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create workflow mutation for visual builder
  const createWorkflowFromVisual = useMutation({
    mutationFn: async (workflowData: any) => {
      // First create the workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert([{
          name: workflowData.name,
          description: workflowData.description,
          priority: 'medium',
          due_date: null,
          assigned_to: null,
          created_by: profile?.id,
          tags: [],
          status: 'draft' as const
        }])
        .select()
        .single();
      
      if (workflowError) throw workflowError;

      // Then create the workflow steps
      if (workflowData.steps.length > 0) {
        const stepsData = workflowData.steps.map((step: any, index: number) => ({
          workflow_id: workflow.id,
          name: step.name,
          description: step.description,
          step_order: index + 1,
          assigned_to: step.assigned_to,
          estimated_hours: step.estimated_hours || null,
          dependencies: step.dependencies,
          status: 'pending' as const
        }));

        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsData);
        
        if (stepsError) throw stepsError;
      }
      
      return workflow;
    },
    onSuccess: () => {
      toast({
        title: 'Workflow created!',
        description: 'Your visual workflow has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setActiveTab('list');
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating workflow',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleVisualWorkflowSave = (workflowData: any) => {
    createWorkflowFromVisual.mutate(workflowData);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            View Workflows
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Visual Builder
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <WorkflowList />
        </TabsContent>
        
        <TabsContent value="create">
          <WorkflowCreation />
        </TabsContent>
        
        <TabsContent value="visual" className="p-0">
          <VisualWorkflowBuilder onSave={handleVisualWorkflowSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
