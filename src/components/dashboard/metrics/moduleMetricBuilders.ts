
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
import { MetricCardData } from './types';
import { RandomColorAssignment } from '@/utils/themeColorRandomizer';

// Default theme-aware colors that will be overridden by random assignment
const getDefaultColors = () => ({
  color: 'text-foreground',
  bgColor: 'bg-card',
  borderColor: 'border-border'
});

export function buildNeuraFlowMetrics(
  flowMetrics: any, 
  t: (key: string) => string,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: t('dashboard.pendingTasks'),
      value: flowMetrics.pendingTasks,
      icon: Clock,
      ...getDefaultColors()
    },
    {
      title: t('dashboard.activeTasks'),
      value: flowMetrics.inProgressTasks,
      icon: PlayCircle,
      ...getDefaultColors()
    },
    {
      title: t('dashboard.completedToday'),
      value: flowMetrics.completedTasksToday,
      icon: CheckCircle,
      ...getDefaultColors()
    }
  ];

  // Apply random colors with fallback
  return cards.map(card => ({
    ...card,
    ...(colorAssignment?.[card.title] || getDefaultColors())
  }));
}

export function buildNeuraCrmMetrics(
  crmMetrics: any,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: 'Total Leads',
      value: crmMetrics.totalLeads,
      icon: Users,
      ...getDefaultColors()
    },
    {
      title: 'Active Deals',
      value: crmMetrics.activeDeals,
      icon: Target,
      ...getDefaultColors()
    },
    {
      title: 'Monthly Revenue',
      value: crmMetrics.monthlyRevenue,
      icon: DollarSign,
      ...getDefaultColors()
    }
  ];

  // Apply random colors with fallback
  return cards.map(card => ({
    ...card,
    ...(colorAssignment?.[card.title] || getDefaultColors())
  }));
}

export function buildNeuraFormsMetrics(
  formsMetrics: any,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: 'Form Submissions',
      value: formsMetrics.submissions,
      icon: FileText,
      ...getDefaultColors()
    },
    {
      title: 'Active Forms',
      value: formsMetrics.activeForms,
      icon: Activity,
      ...getDefaultColors()
    }
  ];

  // Apply random colors with fallback
  return cards.map(card => ({
    ...card,
    ...(colorAssignment?.[card.title] || getDefaultColors())
  }));
}

export function buildNeuraEduMetrics(
  eduMetrics: any,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: 'Active Students',
      value: eduMetrics.activeStudents,
      icon: Users,
      ...getDefaultColors()
    },
    {
      title: 'Course Completion',
      value: `${eduMetrics.completionRate}%`,
      icon: BookOpen,
      ...getDefaultColors()
    }
  ];

  // Apply random colors with fallback
  return cards.map(card => ({
    ...card,
    ...(colorAssignment?.[card.title] || getDefaultColors())
  }));
}

export function buildFallbackMetrics(colorAssignment?: RandomColorAssignment): MetricCardData[] {
  const cards = [
    {
      title: 'System Status',
      value: 'Online',
      icon: Activity,
      ...getDefaultColors()
    },
    {
      title: 'Performance',
      value: '99%',
      icon: TrendingUp,
      ...getDefaultColors()
    }
  ];

  // Apply random colors with fallback
  return cards.map(card => ({
    ...card,
    ...(colorAssignment?.[card.title] || getDefaultColors())
  }));
}
