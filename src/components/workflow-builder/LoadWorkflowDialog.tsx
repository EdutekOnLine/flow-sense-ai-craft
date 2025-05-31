
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Trash2, Edit } from 'lucide-react';
import { useWorkflowPersistence } from '@/hooks/useWorkflowPersistence';

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface LoadWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (workflowId: string) => void;
  onDelete?: (workflowId: string) => void;
}

export function LoadWorkflowDialog({
  isOpen,
  onClose,
  onLoad,
  onDelete
}: LoadWorkflowDialogProps) {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { listWorkflows, deleteWorkflow } = useWorkflowPersistence();

  useEffect(() => {
    if (isOpen) {
      loadWorkflows();
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkflows(filtered);
  }, [workflows, searchTerm]);

  const loadWorkflows = async () => {
    setIsLoading(true);
    const data = await listWorkflows();
    setWorkflows(data);
    setIsLoading(false);
  };

  const handleDelete = async (workflowId: string, workflowName: string) => {
    if (confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      await deleteWorkflow(workflowId);
      await loadWorkflows(); // Refresh the list
      if (onDelete) {
        onDelete(workflowId);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Load Workflow</DialogTitle>
          <DialogDescription>
            Select a workflow to load into the builder.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading workflows...</span>
            </div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No workflows match your search.' : 'No workflows found.'}
            </div>
          ) : (
            filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  onLoad(workflow.id);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {workflow.name}
                    </h3>
                    {workflow.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {workflow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Updated {formatDate(workflow.updated_at)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Created {formatDate(workflow.created_at)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(workflow.id, workflow.name);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
