
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface TaskStatsHeaderProps {
  pendingCount: number;
  inProgressCount: number;
}

export function TaskStatsHeader({ pendingCount, inProgressCount }: TaskStatsHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-status-pending-bg text-status-pending text-xs">
          {pendingCount} {t('status.pending')}
        </Badge>
        <Badge variant="secondary" className="bg-status-active-bg text-status-active text-xs">
          {inProgressCount} {t('status.active')}
        </Badge>
      </div>
    </div>
  );
}
