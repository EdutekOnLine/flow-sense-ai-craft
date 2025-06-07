
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

  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows available</h3>
          <p className="text-gray-600">
            Workflows will appear here when they're created and you're assigned to start them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <Card key={workflow.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-gray-900">{workflow.name}</CardTitle>
                  {workflow.is_reusable && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      <Repeat className="h-3 w-3 mr-1" />
                      Reusable
                    </Badge>
                  )}
                  {!workflow.is_reusable && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      One-time
                    </Badge>
                  )}
                </div>
                {workflow.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {workflow.description}
                  </p>
                )}
              </div>
              <Play className="h-6 w-6 text-blue-600 flex-shrink-0 ml-3" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>First Step:</span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-1">{workflow.start_step.name}</h4>
                {workflow.start_step.description && (
                  <p className="text-sm text-blue-700">
                    {workflow.start_step.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {workflow.start_step.metadata?.inputs?.length > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  {workflow.start_step.metadata.inputs.length} input(s) required
                </Badge>
              )}
              
              {workflow.is_reusable && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <Repeat className="h-3 w-3 mr-1" />
                  Multi-use
                </Badge>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <StartWorkflowDialog
                workflow={workflow}
                onStartWorkflow={onStartWorkflow}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
