
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from './AnimatedCounter';
import { useRealtimeDashboardMetrics } from '@/hooks/useRealtimeDashboardMetrics';
import { useModuleDashboardData } from '@/hooks/useModuleDashboardData';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useTranslation } from 'react-i18next';
import { createRandomColorAssignment } from '@/utils/themeColorRandomizer';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Activity, 
  Users,
  DollarSign,
  FileText,
  BookOpen,
  Repeat,
  Workflow,
  Target,
  Loader2,
  LucideIcon
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function DashboardMetrics() {
  const { metrics: workflowMetrics, isLoading: workflowLoading } = useRealtimeDashboardMetrics();
  const { data: moduleData, isLoading: moduleLoading } = useModuleDashboardData();
  const { canAccessModule } = useModulePermissions();
  const { t } = useTranslation();

  // Generate session key that changes every 5 minutes for stable colors
  const sessionKey = useMemo(() => {
    return Math.floor(Date.now() / (1000 * 60 * 5));
  }, []);

  // Build all metric cards with stable color assignment
  const metricCards = useMemo(() => {
    const cards: MetricCard[] = [];

    // Core workflow metrics (always visible if NeuraFlow is accessible)
    if (canAccessModule('neura-flow')) {
      cards.push(
        {
          title: t('dashboard.pendingTasks'),
          value: workflowMetrics.pendingTasks,
          icon: Clock
        },
        {
          title: t('dashboard.activeTasks'),
          value: workflowMetrics.inProgressTasks,
          icon: PlayCircle
        },
        {
          title: t('dashboard.completedToday'),
          value: workflowMetrics.completedTasksToday,
          icon: CheckCircle
        },
        {
          title: t('dashboard.activeWorkflows'),
          value: workflowMetrics.activeWorkflows,
          icon: Activity
        },
        {
          title: t('dashboard.reusableWorkflows'),
          value: workflowMetrics.myReusableWorkflows,
          icon: Repeat
        },
        {
          title: t('dashboard.totalWorkflows'),
          value: workflowMetrics.totalSavedWorkflows,
          icon: Workflow
        }
      );
    }

    // Module-specific metrics
    if (canAccessModule('neura-crm') && moduleData.moduleMetrics['neura-crm']) {
      const crmMetrics = moduleData.moduleMetrics['neura-crm'];
      cards.push(
        {
          title: 'Total Leads',
          value: crmMetrics.totalLeads,
          icon: Users
        },
        {
          title: 'Active Deals',
          value: crmMetrics.activeDeals,
          icon: Target
        },
        {
          title: 'Monthly Revenue',
          value: crmMetrics.monthlyRevenue,
          icon: DollarSign
        }
      );
    }

    if (canAccessModule('neura-forms') && moduleData.moduleMetrics['neura-forms']) {
      const formsMetrics = moduleData.moduleMetrics['neura-forms'];
      cards.push(
        {
          title: 'Form Submissions',
          value: formsMetrics.submissions,
          icon: FileText
        },
        {
          title: 'Active Forms',
          value: formsMetrics.activeForms,
          icon: Activity
        }
      );
    }

    if (canAccessModule('neura-edu') && moduleData.moduleMetrics['neura-edu']) {
      const eduMetrics = moduleData.moduleMetrics['neura-edu'];
      cards.push(
        {
          title: 'Active Students',
          value: eduMetrics.activeStudents,
          icon: Users
        },
        {
          title: 'Course Completion',
          value: `${eduMetrics.completionRate}%`,
          icon: BookOpen
        }
      );
    }

    // Create stable color assignment for all card titles
    const cardTitles = cards.map(card => card.title);
    const colorAssignment = createRandomColorAssignment(cardTitles, sessionKey);

    // Apply colors to cards
    return cards.map(card => ({
      ...card,
      ...colorAssignment[card.title]
    }));
  }, [workflowMetrics, moduleData, canAccessModule, t, sessionKey]);

  const isLoading = workflowLoading || moduleLoading;

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

  if (metricCards.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-border bg-gradient-theme-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">Online</span>
                  <Badge variant="secondary" className="text-xs bg-background/50 text-muted-foreground animate-pulse">
                    LIVE
                  </Badge>
                </div>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
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
