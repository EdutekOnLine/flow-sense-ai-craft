
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { ReportQueryEngine } from './ReportQueryEngine';
import { getRTLAwareTextAlign, getRTLAwareSpacing } from '@/utils/rtl';

interface ColumnSelectorProps {
  dataSource: string;
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
}

export function ColumnSelector({ dataSource, selectedColumns, onChange }: ColumnSelectorProps) {
  const { t } = useTranslation();
  
  const availableColumns = ReportQueryEngine.getAvailableColumns(dataSource);

  const handleColumnToggle = (column: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedColumns, column]);
    } else {
      onChange(selectedColumns.filter(col => col !== column));
    }
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === availableColumns.length) {
      onChange([]);
    } else {
      onChange(availableColumns);
    }
  };

  const getColumnDisplayName = (column: string): string => {
    return column
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (availableColumns.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>{t('reports.noColumnsAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center ${getRTLAwareSpacing('margin', 'end', '2')} rtl:flex-row-reverse`}>
        <Checkbox
          id="select-all"
          checked={selectedColumns.length === availableColumns.length}
          onCheckedChange={handleSelectAll}
        />
        <label htmlFor="select-all" className={`text-sm font-medium ${getRTLAwareSpacing('margin', 'start', '2')}`}>
          {t('reports.selectAll')} ({selectedColumns.length}/{availableColumns.length})
        </label>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {availableColumns.map((column) => (
          <div key={column} className={`flex items-center ${getRTLAwareSpacing('margin', 'end', '2')} rtl:flex-row-reverse`}>
            <Checkbox
              id={column}
              checked={selectedColumns.includes(column)}
              onCheckedChange={(checked) => handleColumnToggle(column, checked as boolean)}
            />
            <label htmlFor={column} className={`text-sm ${getRTLAwareSpacing('margin', 'start', '2')} ${getRTLAwareTextAlign('start')}`}>
              {getColumnDisplayName(column)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
