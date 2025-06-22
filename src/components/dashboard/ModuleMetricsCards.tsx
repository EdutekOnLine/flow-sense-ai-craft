
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from './AnimatedCounter';
import { useModuleDashboardData } from '@/hooks/useModuleDashboardData';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Activity, 
  Users,
  DollarSign,
  FileText,
  BookOpen,
  TrendingUp,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ModuleMetricsCards() {
  const { data, isLoading } = useModuleDashboardData();
  const { canAccessModule } = useModulePermissions();
  const { t } = useTranslation();

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

  const metricCards = [];

  // NeuraFlow metrics
  if (canAccessModule('neura-flow') && data.moduleMetrics['neura-flow']) {
    const flowMetrics = data.moduleMetrics['neura-flow'];
    metricCards.push(
      {
        title: t('dashboard.pendingTasks'),
        value: flowMetrics.pendingTasks,
        icon: Clock,
        color: 'text-primary',
        bgColor: 'bg-primary/5',
        borderColor: 'border-primary/20'
      },
      {
        title: t('dashboard.activeTasks'),
        value: flowMetrics.inProgressTasks,
        icon: PlayCircle,
        color: 'text-secondary',
        bgColor: 'bg-secondary/5',
        borderColor: 'border-secondary/20'
      },
      {
        title: t('dashboard.completedToday'),
        value: flowMetrics.completedTasksToday,
        icon: CheckCircle,
        color: 'text-accent',
        bgColor: 'bg-accent/5',
        borderColor: 'border-accent/20'
      }
    );
  }

  // NeuraCRM metrics
  if (canAccessModule('neura-crm') && data.moduleMetrics['neura-crm']) {
    const crmMetrics = data.moduleMetrics['neura-crm'];
    metricCards.push(
      {
        title: 'Total Leads',
        value: crmMetrics.totalLeads,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        title: 'Active Deals',
        value: crmMetrics.activeDeals,
        icon: Target,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        title: 'Monthly Revenue',
        value: crmMetrics.monthlyRevenue,
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      }
    );
  }

  // NeuraForms metrics
  if (canAccessModule('neura-forms') && data.moduleMetrics['neura-forms']) {
    const formsMetrics = data.moduleMetrics['neura-forms'];
    metricCards.push(
      {
        title: 'Form Submissions',
        value: formsMetrics.submissions,
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      {
        title: 'Active Forms',
        value: formsMetrics.activeForms,
        icon: Activity,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      }
    );
  }

  // NeuraEdu metrics
  if (canAccessModule('neura-edu') && data.moduleMetrics['neura-edu']) {
    const eduMetrics = data.moduleMetrics['neura-edu'];
    metricCards.push(
      {
        title: 'Active Students',
        value: eduMetrics.activeStudents,
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        title: 'Course Completion',
        value: `${eduMetrics.completionRate}%`,
        icon: BookOpen,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200'
      }
    );
  }

  // If no modules or limited metrics, show core metrics
  if (metricCards.length === 0) {
    metricCards.push(
      {
        title: 'System Status',
        value: 'Online',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        title: 'Performance',
        value: '99%',
        icon: TrendingUp,
        color: 'text-primary',
        bgColor: 'bg-primary/5',
        borderColor: 'border-primary/20'
      }
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
                      value={typeof card.value === 'string' ? card.value : card.value} 
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
