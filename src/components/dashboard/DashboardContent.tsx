
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import { StartableWorkflows } from '@/components/workflow/StartableWorkflows';
import { SavedWorkflows } from './SavedWorkflows';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DashboardContent() {
  const { 
    instances, 
    startableWorkflows, 
    isLoading,
    startWorkflow,
    refreshWorkflows
  } = useWorkflowInstances();
  
  const [activeTab, setActiveTab] = useState('startable');

  // Auto-refresh every 30 seconds when on startable workflows tab
  useEffect(() => {
    if (activeTab === 'startable') {
      const interval = setInterval(() => {
        refreshWorkflows();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeTab, refreshWorkflows]);

  const handleStartWorkflow = async (workflowId: string, startData: any) => {
    try {
      await startWorkflow(workflowId, startData);
      toast.success('Workflow started successfully!');
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start workflow. Please try again.');
    }
  };

  const handleOpenWorkflow = (workflowId: string) => {
    console.log('Opening workflow:', workflowId);
    // TODO: Navigate to workflow builder with this workflow
    toast.info('Opening workflow in builder...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your workflows and tasks</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger value="startable" className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Available Workflows
            {startableWorkflows.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                {startableWorkflows.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inbox" className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm">
            My Tasks
            {instances.filter(i => i.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200">
                {instances.filter(i => i.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Saved Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="startable" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Start New Workflows</h2>
            <p className="text-blue-700">Choose from available workflows that you can start and execute.</p>
          </div>
          <StartableWorkflows 
            workflows={startableWorkflows} 
            onStartWorkflow={handleStartWorkflow}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="inbox" className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-2">My Active Tasks</h2>
            <p className="text-green-700">View and manage your current workflow assignments and tasks.</p>
          </div>
          <WorkflowInbox />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">My Saved Workflows</h2>
            <p className="text-purple-700">Access and manage your saved workflow templates and designs.</p>
          </div>
          <SavedWorkflows onOpenWorkflow={handleOpenWorkflow} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
