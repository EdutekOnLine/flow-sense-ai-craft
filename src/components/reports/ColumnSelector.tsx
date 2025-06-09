
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnSelectorProps {
  dataSource: string;
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
}

const columnDefinitions: Record<string, Array<{ id: string; name: string; dataType: string }>> = {
  workflow_performance: [
    { id: 'name', name: 'Workflow Name', dataType: 'text' },
    { id: 'status', name: 'Status', dataType: 'text' },
    { id: 'completion_percentage', name: 'Completion %', dataType: 'number' },
    { id: 'total_steps', name: 'Total Steps', dataType: 'number' },
    { id: 'completed_steps', name: 'Completed Steps', dataType: 'number' },
    { id: 'created_by_name', name: 'Created By', dataType: 'text' },
    { id: 'assigned_to_name', name: 'Assigned To', dataType: 'text' },
    { id: 'created_at', name: 'Created Date', dataType: 'date' },
    { id: 'total_estimated_hours', name: 'Estimated Hours', dataType: 'number' },
    { id: 'total_actual_hours', name: 'Actual Hours', dataType: 'number' }
  ],
  user_performance: [
    { id: 'full_name', name: 'User Name', dataType: 'text' },
    { id: 'role', name: 'Role', dataType: 'text' },
    { id: 'department', name: 'Department', dataType: 'text' },
    { id: 'workflows_created', name: 'Workflows Created', dataType: 'number' },
    { id: 'workflows_assigned', name: 'Workflows Assigned', dataType: 'number' },
    { id: 'steps_assigned', name: 'Tasks Assigned', dataType: 'number' },
    { id: 'steps_completed', name: 'Tasks Completed', dataType: 'number' },
    { id: 'completion_rate', name: 'Completion Rate %', dataType: 'number' },
    { id: 'total_estimated_hours', name: 'Estimated Hours', dataType: 'number' },
    { id: 'total_actual_hours', name: 'Actual Hours', dataType: 'number' }
  ],
  workflow_step_assignments: [
    { id: 'workflow_step_id', name: 'Task ID', dataType: 'text' },
    { id: 'assigned_to', name: 'Assigned To', dataType: 'text' },
    { id: 'assigned_by', name: 'Assigned By', dataType: 'text' },
    { id: 'status', name: 'Status', dataType: 'text' },
    { id: 'created_at', name: 'Created Date', dataType: 'date' },
    { id: 'completed_at', name: 'Completed Date', dataType: 'date' },
    { id: 'due_date', name: 'Due Date', dataType: 'date' },
    { id: 'notes', name: 'Notes', dataType: 'text' }
  ],
  department_analytics: [
    { id: 'department', name: 'Department', dataType: 'text' },
    { id: 'total_users', name: 'Total Users', dataType: 'number' },
    { id: 'workflows_created', name: 'Workflows Created', dataType: 'number' },
    { id: 'total_steps', name: 'Total Steps', dataType: 'number' },
    { id: 'completed_steps', name: 'Completed Steps', dataType: 'number' },
    { id: 'department_completion_rate', name: 'Completion Rate %', dataType: 'number' },
    { id: 'total_estimated_hours', name: 'Estimated Hours', dataType: 'number' },
    { id: 'total_actual_hours', name: 'Actual Hours', dataType: 'number' }
  ]
};

export function ColumnSelector({ dataSource, selectedColumns, onChange }: ColumnSelectorProps) {
  const { t } = useTranslation();
  const columns = columnDefinitions[dataSource] || [];

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedColumns, columnId]);
    } else {
      onChange(selectedColumns.filter(id => id !== columnId));
    }
  };

  const handleSelectAll = () => {
    onChange(columns.map(col => col.id));
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{t('reports.selectColumns')}</span>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:underline"
          >
            {t('reports.selectAll')}
          </button>
          <button
            onClick={handleSelectNone}
            className="text-xs text-blue-600 hover:underline"
          >
            {t('reports.selectNone')}
          </button>
        </div>
      </div>
      
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={selectedColumns.includes(column.id)}
                onCheckedChange={(checked) => handleColumnToggle(column.id, checked as boolean)}
              />
              <label htmlFor={column.id} className="text-sm">
                {column.name}
                <span className="text-xs text-gray-500 ml-1">({column.dataType})</span>
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
