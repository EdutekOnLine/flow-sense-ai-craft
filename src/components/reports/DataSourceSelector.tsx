
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRTLAwareTextAlign } from '@/utils/rtl';

interface DataSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const dataSources = [
  { id: 'workflow_performance', nameKey: 'reports.dataSources.workflow_performance' },
  { id: 'user_performance', nameKey: 'reports.dataSources.user_performance' },
  { id: 'workflow_steps', nameKey: 'reports.dataSources.workflow_steps' },
  { id: 'workflow_step_assignments', nameKey: 'reports.dataSources.workflow_step_assignments' },
  { id: 'department_analytics', nameKey: 'reports.dataSources.department_analytics' },
  { id: 'workflow_trends', nameKey: 'reports.dataSources.workflow_trends' },
  { id: 'notifications', nameKey: 'reports.dataSources.notifications' },
  { id: 'workflows', nameKey: 'reports.dataSources.workflows' },
  { id: 'profiles', nameKey: 'reports.dataSources.profiles' }
];

export function DataSourceSelector({ value, onChange }: DataSourceSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${getRTLAwareTextAlign('start')}`}>
        {t('reports.selectDataSource')}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={getRTLAwareTextAlign('start')}>
          <SelectValue placeholder={t('reports.chooseDataSource')} />
        </SelectTrigger>
        <SelectContent>
          {dataSources.map((source) => (
            <SelectItem key={source.id} value={source.id} className={getRTLAwareTextAlign('start')}>
              {t(source.nameKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
