
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { RealtimeActivityFeed } from './RealtimeActivityFeed';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, FileText, BookOpen, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ModularActivityPanel() {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  const { t } = useTranslation();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  const getActivityPanelTitle = () => {
    if (hasMultipleModules) {
      return 'Recent Activity';
    }
    return t('dashboard.recentActivity');
  };

  const getActivityPanelDescription = () => {
    if (hasMultipleModules) {
      return 'Latest updates and activities from all your active modules';
    }
    if (canAccessModule('neura-flow')) return t('dashboard.recentActivityDescription');
    if (canAccessModule('neura-crm')) return 'Recent customer interactions and deal updates';
    if (canAccessModule('neura-forms')) return 'Recent form submissions and response analytics';
    if (canAccessModule('neura-edu')) return 'Recent student activities and course progress';
    return 'Your recent activity and updates';
  };

  const getActivityIcon = () => {
    if (hasMultipleModules) return Sparkles;
    if (canAccessModule('neura-flow')) return Activity;
    if (canAccessModule('neura-crm')) return Users;
    if (canAccessModule('neura-forms')) return FileText;
    if (canAccessModule('neura-edu')) return BookOpen;
    return Activity;
  };

  const ActivityIcon = getActivityIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-muted-foreground to-muted-foreground/70 rounded-xl shadow-card">
          <ActivityIcon className="h-6 w-6 text-muted" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{getActivityPanelTitle()}</h2>
            {hasMultipleModules && (
              <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{getActivityPanelDescription()}</p>
        </div>
      </div>
      <div className="bg-gradient-theme-secondary p-6 rounded-xl border border-border">
        <RealtimeActivityFeed />
      </div>
    </div>
  );
}
