
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, FileText } from 'lucide-react';
import { StartWorkflowDialog } from './StartWorkflowDialog';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';

interface StartableWorkflowsProps {
  workflows: StartableWorkflow[];
  onStartWorkflow: (workflowId: string, startData: any) => Promise<void>;
  isLoading?: boolean;
}

export function StartableWorkflows({ workflows, onStartWorkflow, isLoading }: StartableWorkflowsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows to start</h3>
          <p className="text-gray-600">
            You're not assigned to any workflow start steps at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflows You Can Start</h3>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {workflows.length} Available
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base">{workflow.name}</CardTitle>
                  {workflow.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}
                </div>
                <Play className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">First Step:</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-sm">{workflow.start_step.name}</h4>
                  {workflow.start_step.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {workflow.start_step.description}
                    </p>
                  )}
                </div>
              </div>

              {workflow.start_step.metadata?.inputs?.length > 0 && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  Requires {workflow.start_step.metadata.inputs.length} input(s)
                </div>
              )}

              <div className="pt-2 border-t">
                <StartWorkflowDialog
                  workflow={workflow}
                  onStartWorkflow={onStartWorkflow}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
