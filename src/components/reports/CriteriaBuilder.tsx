
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FilterCriteria, FilterOperator } from './types';
import { Plus, Trash2 } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareSpacing, getRTLAwareIconPosition } from '@/utils/rtl';

interface CriteriaBuilderProps {
  dataSource: string;
  filters: FilterCriteria[];
  onChange: (filters: FilterCriteria[]) => void;
}

const operators: Array<{ value: FilterOperator; labelKey: string }> = [
  { value: 'equals', labelKey: 'reports.operators.equals' },
  { value: 'not_equals', labelKey: 'reports.operators.not_equals' },
  { value: 'contains', labelKey: 'reports.operators.contains' },
  { value: 'not_contains', labelKey: 'reports.operators.not_contains' },
  { value: 'greater_than', labelKey: 'reports.operators.greater_than' },
  { value: 'less_than', labelKey: 'reports.operators.less_than' },
  { value: 'greater_equal', labelKey: 'reports.operators.greater_equal' },
  { value: 'less_equal', labelKey: 'reports.operators.less_equal' },
  { value: 'is_null', labelKey: 'reports.operators.is_null' },
  { value: 'is_not_null', labelKey: 'reports.operators.is_not_null' }
];

const columnDefinitions: Record<string, Array<{ id: string; name: string; dataType: string }>> = {
  workflow_performance: [
    { id: 'name', name: 'Workflow Name', dataType: 'text' },
    { id: 'status', name: 'Status', dataType: 'text' },
    { id: 'completion_percentage', name: 'Completion %', dataType: 'number' },
    { id: 'created_at', name: 'Created Date', dataType: 'date' }
  ],
  user_performance: [
    { id: 'full_name', name: 'User Name', dataType: 'text' },
    { id: 'role', name: 'Role', dataType: 'text' },
    { id: 'department', name: 'Department', dataType: 'text' },
    { id: 'completion_rate', name: 'Completion Rate %', dataType: 'number' }
  ]
};

export function CriteriaBuilder({ dataSource, filters, onChange }: CriteriaBuilderProps) {
  const { t } = useTranslation();
  const columns = columnDefinitions[dataSource] || [];

  const addFilter = () => {
    const newFilter: FilterCriteria = {
      id: crypto.randomUUID(),
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

  return (
    <div className="space-y-4">
      <div className={`flex justify-between items-center rtl:flex-row-reverse`}>
        <span className={`text-sm font-medium ${getRTLAwareTextAlign('start')}`}>
          {t('reports.filters')}
        </span>
        <Button onClick={addFilter} size="sm" variant="outline" className="rtl:flex-row-reverse">
          <Plus className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
          {t('reports.addFilter')}
        </Button>
      </div>

      <div className="space-y-3">
        {filters.map((filter) => (
          <div key={filter.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
            <div className="col-span-4">
              <Select
                value={filter.column}
                onValueChange={(value) => {
                  const column = columns.find(col => col.id === value);
                  updateFilter(filter.id, 'column', value);
                  updateFilter(filter.id, 'dataType', column?.dataType || 'text');
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={t('reports.selectColumn')} />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id} className={getRTLAwareTextAlign('start')}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value} className={getRTLAwareTextAlign('start')}>
                      {t(op.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-4">
              {!['is_null', 'is_not_null'].includes(filter.operator) && (
                <Input
                  className={`h-8 ${getRTLAwareTextAlign('start')}`}
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
