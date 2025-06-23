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

interface MetricCardData {
  title: string;
  value: string | number;
  icon: LucideIcon;
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
    const cardData: MetricCardData[] = [];

    // Core workflow metrics (always visible if NeuraFlow is accessible) - use hardcoded titles for consistency
    if (canAccessModule('neura-flow')) {
      cardData.push(
        {
          title: 'Pending Tasks',
          value: workflowMetrics.pendingTasks,
          icon: Clock
        },
        {
          title: 'Active Tasks',
          value: workflowMetrics.inProgressTasks,
          icon: PlayCircle
        },
        {
          title: 'Completed Today',
          value: workflowMetrics.completedTasksToday,
          icon: CheckCircle
        },
        {
          title: 'Active Workflows',
          value: workflowMetrics.activeWorkflows,
          icon: Activity
        },
        {
          title: 'Reusable Workflows',
          value: workflowMetrics.myReusableWorkflows,
          icon: Repeat
        },
        {
          title: 'Total Workflows',
          value: workflowMetrics.totalSavedWorkflows,
          icon: Workflow
        }
      );
    }

    // Module-specific metrics - use consistent hardcoded titles
    if (canAccessModule('neura-crm') && moduleData.moduleMetrics['neura-crm']) {
      const crmMetrics = moduleData.moduleMetrics['neura-crm'];
      cardData.push(
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
          value: `$${crmMetrics.monthlyRevenue.toLocaleString()}`,
          icon: DollarSign
        }
      );
    }

    if (canAccessModule('neura-forms') && moduleData.moduleMetrics['neura-forms']) {
      const formsMetrics = moduleData.moduleMetrics['neura-forms'];
      cardData.push(
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
      cardData.push(
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
    const cardTitles = cardData.map(card => card.title);
    const colorAssignment = createRandomColorAssignment(cardTitles, sessionKey);

    console.log('🎨 [DashboardMetrics] Card titles:', cardTitles);
    console.log('🎨 [DashboardMetrics] Color assignment:', colorAssignment);

    // Apply colors to cards ensuring every card gets a proper color
    return cardData.map((card, index) => {
      const assignedColors = colorAssignment[card.title];
      
      console.log('🎨 [DashboardMetrics] Processing card:', card.title);
      console.log('🎨 [DashboardMetrics] Assigned colors:', assignedColors);
      
      // Every card should have colors assigned - no fallback needed if colorAssignment works correctly
      if (!assignedColors) {
        console.error('🎨 [DashboardMetrics] No colors assigned for:', card.title);
      }

      return {
        ...card,
        ...assignedColors
      };
    });
  }, [workflowMetrics, moduleData, canAccessModule, sessionKey]);

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
        
        console.log('🎨 [DashboardMetrics] Rendering card:', card.title, 'with colors:', {
          color: card.color,
          bgColor: card.bgColor,
          borderColor: card.borderColor
        });

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
