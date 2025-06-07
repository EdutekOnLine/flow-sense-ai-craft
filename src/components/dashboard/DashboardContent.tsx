
import React, { useState, useEffect } from 'react';
import { SavedWorkflows } from './SavedWorkflows';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Workflow, 
  Activity,
  Sparkles
} from 'lucide-react';

interface DashboardContentProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export default function DashboardContent({ onOpenWorkflow }: DashboardContentProps) {
  const { profile } = useAuth();
  const { 
    startWorkflow
  } = useWorkflowInstances();
  
  const { canEditWorkflows } = useWorkflowPermissions();

  const handleStartWorkflow = async (workflowId: string, startData: any) => {
    try {
      await startWorkflow(workflowId, startData);
      toast.success('Workflow started successfully!');
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start workflow. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with colorful gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Activity className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-purple-100 text-lg">Welcome to your workflow command center</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>

      {/* Saved Workflows Section - Only show for users who can edit workflows */}
      {canEditWorkflows && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Saved Workflows</h2>
              <p className="text-gray-600">Manage your saved workflow templates and start new workflow instances</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <SavedWorkflows 
              onOpenWorkflow={onOpenWorkflow}
              onStartWorkflow={handleStartWorkflow}
            />
          </div>
        </div>
      )}

      {/* Message for employees */}
      {!canEditWorkflows && (
        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-500 rounded-xl w-fit mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-blue-900">Welcome to the Workflow System</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-700 text-lg">
                Workflow functionality is available for admins and managers. 
                Contact your administrator to get workflow creation permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
