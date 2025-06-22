
import React, { useState, useEffect } from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { RealtimeActivityFeed } from './RealtimeActivityFeed';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { formatLocalizedDistanceToNow } from '@/utils/localization';
import { 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  Activity,
  Users,
  FileText,
  BookOpen,
  DollarSign,
  UserPlus
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  module: string;
  isNew?: boolean;
}

export function ModularActivityFeed() {
  const { canAccessModule, getAccessibleModules } = useModulePermissions();
  const { t, i18n } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // If user has NeuraFlow access, show workflow activity feed
  if (canAccessModule('neura-flow')) {
    return <RealtimeActivityFeed />;
  }

  const generateModuleActivities = () => {
    const moduleActivities: ActivityItem[] = [];
    const now = new Date();

    if (canAccessModule('neura-crm')) {
      moduleActivities.push(
        {
          id: 'crm-1',
          type: 'lead_created',
          title: 'New lead generated',
          description: 'John Smith submitted contact form',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          module: 'NeuraCRM'
        },
        {
          id: 'crm-2',
          type: 'deal_closed',
          title: 'Deal closed',
          description: '$5,000 deal with Acme Corp completed',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          module: 'NeuraCRM'
        }
      );
    }

    if (canAccessModule('neura-forms')) {
      moduleActivities.push(
        {
          id: 'forms-1',
          type: 'form_submitted',
          title: 'Form submission received',
          description: 'Customer feedback form completed',
          timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          module: 'NeuraForms'
        },
        {
          id: 'forms-2',
          type: 'form_created',
          title: 'New form created',  
          description: 'Product inquiry form published',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
          module: 'NeuraForms'
        }
      );
    }

    if (canAccessModule('neura-edu')) {
      moduleActivities.push(
        {
          id: 'edu-1',
          type: 'course_completed',
          title: 'Course completed',
          description: 'Sarah Johnson finished "Intro to Marketing"',
          timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          module: 'NeuraEdu'
        },
        {
          id: 'edu-2',
          type: 'student_enrolled',
          title: 'New enrollment',
          description: 'Mike Davis enrolled in "Advanced Analytics"',
          timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
          module: 'NeuraEdu'
        }
      );
    }

    // Sort by timestamp and take latest 5
    return moduleActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  useEffect(() => {
    setActivities(generateModuleActivities());
    setIsLoading(false);
  }, [canAccessModule]);

  const getActivityIcon = (type: string, module: string) => {
    if (module === 'NeuraCRM') {
      switch (type) {
        case 'lead_created': return <UserPlus className="h-4 w-4 text-blue-600" />;
        case 'deal_closed': return <DollarSign className="h-4 w-4 text-green-600" />;
        default: return <Users className="h-4 w-4 text-blue-600" />;
      }
    }
    if (module === 'NeuraForms') {
      return <FileText className="h-4 w-4 text-purple-600" />;
    }
    if (module === 'NeuraEdu') {
      return <BookOpen className="h-4 w-4 text-orange-600" />;
    }
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('dashboard.recentActivity')}</h3>
        <Badge variant="secondary" className="animate-pulse bg-accent text-accent-foreground">
          LIVE
        </Badge>
      </div>
      
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          {t('dashboard.noRecentActivity')}
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type, activity.module)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatLocalizedDistanceToNow(new Date(activity.timestamp), i18n.language)}
                  </p>
                  <Badge variant="outline" className="text-xs">{activity.module}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
