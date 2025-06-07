
import React, { useState, useEffect } from 'react';
import { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
import { StartableWorkflows } from '@/components/workflow/StartableWorkflows';
import { SavedWorkflows } from './SavedWorkflows';
import { useWorkflowInstances } from '@/hooks/useWorkflowInstances';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  Workflow, 
  TrendingUp, 
  Activity,
  Sparkles,
  Target
} from 'lucide-react';

interface DashboardContentProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export default function DashboardContent({ onOpenWorkflow }: DashboardContentProps) {
  const { 
    instances, 
    startableWorkflows, 
    isLoading,
    startWorkflow,
    refreshWorkflows
  } = useWorkflowInstances();
  
  const { assignments } = useWorkflowAssignments();
  const { canEditWorkflows } = useWorkflowPermissions();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWorkflows();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshWorkflows]);

  const handleStartWorkflow = async (workflowId: string, startData: any) => {
    try {
      await startWorkflow(workflowId, startData);
      toast.success('Workflow started successfully!');
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start workflow. Please try again.');
    }
  };

  // Calculate accurate statistics
  const activeInstances = instances.filter(i => i.status === 'active');
  const completedInstances = instances.filter(i => i.status === 'completed');
  const activeAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress');
  const availableWorkflows = startableWorkflows.length;

  // Calculate efficiency rate (completed vs total)
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const efficiencyRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header with colorful gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 rounded-2xl p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="text-purple-100 text-lg">Welcome to your workflow command center</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-blue-900">
              <span className="text-sm font-medium">Available Workflows</span>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{availableWorkflows}</div>
            <p className="text-blue-600 text-sm mt-1">Ready to start</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-green-900">
              <span className="text-sm font-medium">Active Tasks</span>
              <div className="p-2 bg-green-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{activeAssignments.length}</div>
            <p className="text-green-600 text-sm mt-1">Waiting for you</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-purple-900">
              <span className="text-sm font-medium">Completed</span>
              <div className="p-2 bg-purple-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{completedAssignments}</div>
            <p className="text-purple-600 text-sm mt-1">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-orange-900">
              <span className="text-sm font-medium">Efficiency</span>
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">{efficiencyRate}%</div>
            <p className="text-orange-600 text-sm mt-1">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Workflows Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Workflows</h2>
            <p className="text-gray-600">Choose from workflows you can start and execute</p>
          </div>
          {availableWorkflows > 0 && (
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 border-blue-200 text-lg px-3 py-1">
              {availableWorkflows}
            </Badge>
          )}
        </div>
        <StartableWorkflows 
          workflows={startableWorkflows} 
          onStartWorkflow={handleStartWorkflow}
          isLoading={isLoading}
        />
      </div>

      {/* My Active Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Active Tasks</h2>
            <p className="text-gray-600">Manage your assigned workflow steps</p>
          </div>
          {activeAssignments.length > 0 && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 border-green-200 text-lg px-3 py-1">
              {activeAssignments.length}
            </Badge>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <WorkflowInbox />
        </div>
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
              <p className="text-gray-600">Manage and edit your saved workflow templates</p>
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
    </div>
  );
}
