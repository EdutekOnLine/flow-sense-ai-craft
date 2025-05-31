
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Download, Upload, Play } from 'lucide-react';

interface WorkflowToolbarProps {
  onAddNode: (type: string, label: string, description: string) => void;
}

export function WorkflowToolbar({ onAddNode }: WorkflowToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-900">Workflow Builder</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddNode('start', 'Start', 'Start of the workflow')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Start
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        
        <Button
          size="sm"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Play className="h-4 w-4" />
          Run
        </Button>
      </div>
    </div>
  );
}
