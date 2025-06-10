
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSourceWithJoins, SelectedColumn } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';

interface MultiColumnSelectorProps {
  dataSources: DataSourceWithJoins[];
  selectedColumns: SelectedColumn[];
  onChange: (columns: SelectedColumn[]) => void;
}

export function MultiColumnSelector({ dataSources, selectedColumns, onChange }: MultiColumnSelectorProps) {
  const { t } = useTranslation();

  const handleColumnToggle = (sourceId: string, column: string, checked: boolean) => {
    if (checked) {
      const newColumn: SelectedColumn = {
        sourceId,
        column,
        alias: dataSources.length > 1 ? `${sourceId}_${column}` : undefined
      };
      onChange([...selectedColumns, newColumn]);
    } else {
      onChange(selectedColumns.filter(col => !(col.sourceId === sourceId && col.column === column)));
    }
  };

  const handleSelectAllForSource = (sourceId: string) => {
    const availableColumns = ReportQueryEngine.getAvailableColumns(sourceId);
    const sourceColumns = selectedColumns.filter(col => col.sourceId === sourceId);
    
    if (sourceColumns.length === availableColumns.length) {
      // Deselect all for this source
      onChange(selectedColumns.filter(col => col.sourceId !== sourceId));
    } else {
      // Select all for this source
      const newColumns = availableColumns.map(column => ({
        sourceId,
        column,
        alias: dataSources.length > 1 ? `${sourceId}_${column}` : undefined
      }));
      
      const otherColumns = selectedColumns.filter(col => col.sourceId !== sourceId);
      onChange([...otherColumns, ...newColumns]);
    }
  };

  const getColumnDisplayName = (column: string): string => {
    return column
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSourceName = (sourceId: string): string => {
    const sourceNames = {
      'workflow_performance': 'Workflow Performance',
      'user_performance': 'User Performance',
      'workflows': 'Workflows',
      'profiles': 'Users',
      'workflow_steps': 'Workflow Steps',
      'workflow_step_assignments': 'Task Assignments',
      'department_analytics': 'Department Analytics',
      'workflow_trends': 'Workflow Trends',
      'notifications': 'Notifications'
    };
    return sourceNames[sourceId] || sourceId;
  };

  const isColumnSelected = (sourceId: string, column: string) => {
    return selectedColumns.some(col => col.sourceId === sourceId && col.column === column);
  };

  if (dataSources.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>{t('reports.selectDataSourceFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {t('reports.selectedColumns')}: {selectedColumns.length}
      </div>

      {dataSources.map((dataSource) => {
        const availableColumns = ReportQueryEngine.getAvailableColumns(dataSource.sourceId);
        const sourceColumns = selectedColumns.filter(col => col.sourceId === dataSource.sourceId);
        
        if (availableColumns.length === 0) return null;

        return (
          <Card key={dataSource.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <span>{getSourceName(dataSource.sourceId)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {sourceColumns.length}/{availableColumns.length}
                  </Badge>
                </CardTitle>
                <Checkbox
                  checked={sourceColumns.length === availableColumns.length}
                  onCheckedChange={() => handleSelectAllForSource(dataSource.sourceId)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableColumns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${dataSource.sourceId}-${column}`}
                      checked={isColumnSelected(dataSource.sourceId, column)}
                      onCheckedChange={(checked) => 
                        handleColumnToggle(dataSource.sourceId, column, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`${dataSource.sourceId}-${column}`} 
                      className="text-sm flex-1"
                    >
                      {getColumnDisplayName(column)}
                    </label>
                    {dataSources.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {dataSource.sourceId}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
