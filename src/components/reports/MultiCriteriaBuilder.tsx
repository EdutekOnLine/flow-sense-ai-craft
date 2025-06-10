
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterCriteria, FilterOperator, DataSourceWithJoins } from './types';
import { ReportQueryEngine } from './ReportQueryEngine';
import { Plus, Trash2 } from 'lucide-react';

interface MultiCriteriaBuilderProps {
  dataSources: DataSourceWithJoins[];
  filters: FilterCriteria[];
  onChange: (filters: FilterCriteria[]) => void;
}

const operators: Array<{ value: FilterOperator; label: string }> = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'greater_equal', label: 'Greater or Equal' },
  { value: 'less_equal', label: 'Less or Equal' },
  { value: 'is_null', label: 'Is Empty' },
  { value: 'is_not_null', label: 'Is Not Empty' }
];

export function MultiCriteriaBuilder({ dataSources, filters, onChange }: MultiCriteriaBuilderProps) {
  const { t } = useTranslation();

  const addFilter = () => {
    const newFilter: FilterCriteria = {
      id: crypto.randomUUID(),
      sourceId: dataSources[0]?.sourceId || '',
      column: '',
      operator: 'equals',
      value: '',
      dataType: 'text'
    };
    onChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, field: keyof FilterCriteria, value: any) => {
    onChange(filters.map(filter => 
      filter.id === id ? { ...filter, [field]: value } : filter
    ));
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter(filter => filter.id !== id));
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

  const getAvailableColumns = (sourceId: string) => {
    return ReportQueryEngine.getAvailableColumns(sourceId);
  };

  const getColumnDisplayName = (column: string): string => {
    return column
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{t('reports.filters')}</span>
        <Button onClick={addFilter} size="sm" variant="outline" disabled={dataSources.length === 0}>
          <Plus className="h-4 w-4 mr-1" />
          {t('reports.addFilter')}
        </Button>
      </div>

      <div className="space-y-3">
        {filters.map((filter) => (
          <div key={filter.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
            <div className="col-span-3">
              <Select
                value={filter.sourceId}
                onValueChange={(value) => {
                  updateFilter(filter.id, 'sourceId', value);
                  updateFilter(filter.id, 'column', ''); // Reset column when source changes
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Data Source" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map((dataSource) => (
                    <SelectItem key={dataSource.sourceId} value={dataSource.sourceId}>
                      {getSourceName(dataSource.sourceId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Select
                value={filter.column}
                onValueChange={(value) => updateFilter(filter.id, 'column', value)}
                disabled={!filter.sourceId}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={t('reports.selectColumn')} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableColumns(filter.sourceId).map((column) => (
                    <SelectItem key={column} value={column}>
                      {getColumnDisplayName(column)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              {!['is_null', 'is_not_null'].includes(filter.operator) && (
                <Input
                  className="h-8"
                  type={filter.dataType === 'number' ? 'number' : 'text'}
                  value={filter.value as string}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                  placeholder={t('reports.enterValue')}
                />
              )}
            </div>

            <div className="col-span-1">
              <Button
                onClick={() => removeFilter(filter.id)}
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('reports.noFilters')}</p>
          <p className="text-sm">{t('reports.addFiltersToRefine')}</p>
        </div>
      )}
    </div>
  );
}
