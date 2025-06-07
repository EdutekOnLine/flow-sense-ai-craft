
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, FileText, Repeat } from 'lucide-react';
import { StartWorkflowDialog } from './StartWorkflowDialog';
import { StartableWorkflow } from '@/hooks/useWorkflowInstances';

interface StartableWorkflowsProps {
  workflows: StartableWorkflow[];
  onStartWorkflow: (workflowId: string, startData: any) => Promise<void>;
  isLoading?: boolean;
}

export function StartableWorkflows({ 
  workflows, 
  onStartWorkflow, 
  isLoading
}: StartableWorkflowsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const reusableWorkflows = workflows.filter(w => w.is_reusable);
  const nonReusableWorkflows = workflows.filter(w => !w.is_reusable);

  return (
    <div className="space-y-6">
      {/* Reusable Workflows Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-700">Reusable Workflows</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {reusableWorkflows.length} Available
          </Badge>
        </div>

        {reusableWorkflows.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Repeat className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reusable workflows available</h3>
              <p className="text-gray-600">
                Reusable workflows will appear here when they're created and you're assigned to start them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reusableWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Repeat className="h-3 w-3 mr-1" />
                          Reusable
                        </Badge>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                    <Play className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">First Step:</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md">
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

                  <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    Can be started multiple times
                  </div>

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
        )}
      </div>

      {/* Non-Reusable Workflows Section */}
      {nonReusableWorkflows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-green-700">One-Time Workflows</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {nonReusableWorkflows.length} Available
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nonReusableWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
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
                    <div className="bg-green-50 p-3 rounded-md">
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

                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    Can only be started once
                  </div>

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
      )}
    </div>
  );
}
