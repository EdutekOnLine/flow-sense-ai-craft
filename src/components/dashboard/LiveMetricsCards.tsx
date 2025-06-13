
import React from 'react';
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

export function LiveMetricsCards() {
  const { metrics, isLoading } = useRealtimeDashboardMetrics();
  const { t } = useTranslation();

  const metricCards = [
    {
      title: t('dashboard.pendingTasks'),
      value: metrics.pendingTasks,
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20'
    },
    {
      title: t('dashboard.activeTasks'),
      value: metrics.inProgressTasks,
      icon: PlayCircle,
      color: 'text-secondary',
      bgColor: 'bg-secondary/5',
      borderColor: 'border-secondary/20'
    },
    {
      title: t('dashboard.completedToday'),
      value: metrics.completedTasksToday,
      icon: CheckCircle,
      color: 'text-accent',
      bgColor: 'bg-accent/5',
      borderColor: 'border-accent/20'
    },
    {
      title: t('dashboard.activeWorkflows'),
      value: metrics.activeWorkflows,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30'
    },
    {
      title: t('dashboard.reusableWorkflows'),
      value: metrics.myReusableWorkflows,
      icon: Repeat,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/30'
    },
    {
      title: t('dashboard.totalWorkflows'),
      value: metrics.totalSavedWorkflows,
      icon: Workflow,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      borderColor: 'border-muted/30'
    }
  ];

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
