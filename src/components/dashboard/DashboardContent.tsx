
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import { StartableWorkflows } from '@/components/workflow/StartableWorkflows';
import { SavedWorkflows } from './SavedWorkflows';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardContent() {
  const { 
    instances, 
    startableWorkflows, 
    isLoading,
    lastFetchTime,
    startWorkflow,
    refreshWorkflows
  } = useWorkflowInstances();
  
  const [activeTab, setActiveTab] = useState('startable');

  // Auto-refresh every 30 seconds when on startable workflows tab
  useEffect(() => {
    if (activeTab === 'startable') {
      const interval = setInterval(() => {
        console.log('Auto-refreshing startable workflows...');
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

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered from dashboard');
    refreshWorkflows();
    toast.success('Refreshing workflows...');
  };

  const handleOpenWorkflow = (workflowId: string) => {
    console.log('Opening workflow:', workflowId);
    // TODO: Navigate to workflow builder with this workflow
    toast.info('Opening workflow in builder...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button
          variant="outline"
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="startable" className="relative">
            Available Workflows
            {startableWorkflows.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                {startableWorkflows.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inbox" className="relative">
            My Tasks
            {instances.filter(i => i.status === 'active').length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                {instances.filter(i => i.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved">Saved Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="startable" className="space-y-6">
          <StartableWorkflows 
            workflows={startableWorkflows} 
            onStartWorkflow={handleStartWorkflow}
            isLoading={isLoading}
            lastFetchTime={lastFetchTime}
            onRefresh={handleManualRefresh}
          />
        </TabsContent>

        <TabsContent value="inbox" className="space-y-6">
          <WorkflowInbox />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <SavedWorkflows onOpenWorkflow={handleOpenWorkflow} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
