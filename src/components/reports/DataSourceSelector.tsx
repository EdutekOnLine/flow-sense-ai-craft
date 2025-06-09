
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const dataSources = [
  { id: 'workflow_performance', name: 'Workflow Performance' },
  { id: 'user_performance', name: 'User Performance' },
  { id: 'workflow_steps', name: 'Workflow Steps' },
  { id: 'workflow_step_assignments', name: 'Task Assignments' },
  { id: 'department_analytics', name: 'Department Analytics' },
  { id: 'workflow_trends', name: 'Workflow Trends' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'workflows', name: 'Workflows' },
  { id: 'profiles', name: 'Users' }
];

export function DataSourceSelector({ value, onChange }: DataSourceSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t('reports.selectDataSource')}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={t('reports.chooseDataSource')} />
        </SelectTrigger>
        <SelectContent>
          {dataSources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
