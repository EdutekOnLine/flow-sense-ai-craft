
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from './AnimatedCounter';
import { useRealtimeDashboardMetrics } from '@/hooks/useRealtimeDashboardMetrics';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Activity, 
  Repeat, 
  Workflow,
  Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createRandomColorAssignment } from '@/utils/themeColorRandomizer';

export function LiveMetricsCards() {
  const { metrics, isLoading } = useRealtimeDashboardMetrics();
  const { t } = useTranslation();

  // Generate session key that changes every 5 minutes
  const sessionKey = useMemo(() => {
    return Math.floor(Date.now() / (1000 * 60 * 5));
  }, []);

  // Create stable color assignment for the session
  const colorAssignment = useMemo(() => {
    const cardTitles = [
      t('dashboard.pendingTasks'),
      t('dashboard.activeTasks'),
      t('dashboard.completedToday'),
      t('dashboard.activeWorkflows'),
      t('dashboard.reusableWorkflows'),
      t('dashboard.totalWorkflows')
    ];

    return createRandomColorAssignment(cardTitles, sessionKey);
  }, [t, sessionKey]);

  // Build metric cards with stable colors but dynamic data
  const metricCards = useMemo(() => {
    return [
      {
        title: t('dashboard.pendingTasks'),
        value: metrics.pendingTasks,
        icon: Clock,
        ...colorAssignment[t('dashboard.pendingTasks')]
      },
      {
        title: t('dashboard.activeTasks'),
        value: metrics.inProgressTasks,
        icon: PlayCircle,
        ...colorAssignment[t('dashboard.activeTasks')]
      },
      {
        title: t('dashboard.completedToday'),
        value: metrics.completedTasksToday,
        icon: CheckCircle,
        ...colorAssignment[t('dashboard.completedToday')]
      },
      {
        title: t('dashboard.activeWorkflows'),
        value: metrics.activeWorkflows,
        icon: Activity,
        ...colorAssignment[t('dashboard.activeWorkflows')]
      },
      {
        title: t('dashboard.reusableWorkflows'),
        value: metrics.myReusableWorkflows,
        icon: Repeat,
        ...colorAssignment[t('dashboard.reusableWorkflows')]
      },
      {
        title: t('dashboard.totalWorkflows'),
        value: metrics.totalSavedWorkflows,
        icon: Workflow,
        ...colorAssignment[t('dashboard.totalWorkflows')]
      }
    ];
  }, [metrics, t, colorAssignment]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-8"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className={`${card.borderColor} ${card.bgColor} hover:shadow-card transition-shadow duration-200`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <div className="flex items-center gap-2">
                    <AnimatedCounter 
                      value={card.value} 
                      className={`text-2xl font-bold ${card.color}`}
                    />
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-background/50 text-muted-foreground animate-pulse"
                    >
                      LIVE
                    </Badge>
                  </div>
                </div>
                <Icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
