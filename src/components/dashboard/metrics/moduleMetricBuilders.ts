
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
  ];

  // Apply random colors if provided
  if (colorAssignment) {
    return cards.map(card => ({
      ...card,
      ...colorAssignment[card.title] || card
    }));
  }

  return cards;
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
      color: 'text-module-accent-1',
      bgColor: 'bg-module-accent-1',
      borderColor: 'border-module-accent-1'
    },
    {
      title: 'Active Deals',
      value: crmMetrics.activeDeals,
      icon: Target,
      color: 'text-module-accent-1',
      bgColor: 'bg-module-accent-1',
      borderColor: 'border-module-accent-1'
    },
    {
      title: 'Monthly Revenue',
      value: crmMetrics.monthlyRevenue,
      icon: DollarSign,
      color: 'text-module-accent-1',
      bgColor: 'bg-module-accent-1',
      borderColor: 'border-module-accent-1'
    }
  ];

  // Apply random colors if provided
  if (colorAssignment) {
    return cards.map(card => ({
      ...card,
      ...colorAssignment[card.title] || card
    }));
  }

  return cards;
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
      color: 'text-module-accent-2',
      bgColor: 'bg-module-accent-2',
      borderColor: 'border-module-accent-2'
    },
    {
      title: 'Active Forms',
      value: formsMetrics.activeForms,
      icon: Activity,
      color: 'text-module-accent-3',
      bgColor: 'bg-module-accent-3',
      borderColor: 'border-module-accent-3'
    }
  ];

  // Apply random colors if provided
  if (colorAssignment) {
    return cards.map(card => ({
      ...card,
      ...colorAssignment[card.title] || card
    }));
  }

  return cards;
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
      color: 'text-module-accent-4',
      bgColor: 'bg-module-accent-4',
      borderColor: 'border-module-accent-4'
    },
    {
      title: 'Course Completion',
      value: `${eduMetrics.completionRate}%`,
      icon: BookOpen,
      color: 'text-module-accent-4',
      bgColor: 'bg-module-accent-4',
      borderColor: 'border-module-accent-4'
    }
  ];

  // Apply random colors if provided
  if (colorAssignment) {
    return cards.map(card => ({
      ...card,
      ...colorAssignment[card.title] || card
    }));
  }

  return cards;
}

export function buildFallbackMetrics(colorAssignment?: RandomColorAssignment): MetricCardData[] {
  const cards = [
    {
      title: 'System Status',
      value: 'Online',
      icon: Activity,
      color: 'text-status-success',
      bgColor: 'bg-status-success-bg',
      borderColor: 'border-theme-accent'
    },
    {
      title: 'Performance',
      value: '99%',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20'
    }
  ];

  // Apply random colors if provided
  if (colorAssignment) {
    return cards.map(card => ({
      ...card,
      ...colorAssignment[card.title] || card
    }));
  }

  return cards;
}
