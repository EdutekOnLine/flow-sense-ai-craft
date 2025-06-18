
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface AssignmentFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function AssignmentFilters({ statusFilter, onStatusFilterChange }: AssignmentFiltersProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-theme-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-48 bg-card/80 backdrop-blur-sm">
              <SelectValue placeholder={t('workflow.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('workflow.allAssignments')}</SelectItem>
              <SelectItem value="pending">{t('workflow.pending')}</SelectItem>
              <SelectItem value="in_progress">{t('workflow.inProgress')}</SelectItem>
              <SelectItem value="completed">{t('workflow.completed')}</SelectItem>
              <SelectItem value="skipped">{t('workflow.skipped')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
