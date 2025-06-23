
import { useMemo } from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useTranslation } from 'react-i18next';
import { MetricCardData } from './types';
import { 
  buildNeuraFlowMetrics, 
  buildNeuraCrmMetrics, 
  buildNeuraFormsMetrics, 
  buildNeuraEduMetrics, 
  buildFallbackMetrics 
} from './moduleMetricBuilders';
import { createRandomColorAssignment } from '@/utils/themeColorRandomizer';

export function useMetricCards(moduleMetrics: Record<string, any>) {
  const { canAccessModule } = useModulePermissions();
  const { t } = useTranslation();

  // Generate session key that changes every 5 minutes
  const sessionKey = useMemo(() => {
    return Math.floor(Date.now() / (1000 * 60 * 5));
  }, []);

  // Collect card titles and create color assignment (stable for the session)
  const colorAssignment = useMemo(() => {
    const cardTitles: string[] = [];

    if (canAccessModule('neura-flow')) {
      cardTitles.push(
        t('dashboard.pendingTasks'),
        t('dashboard.activeTasks'),
        t('dashboard.completedToday')
      );
    }

    if (canAccessModule('neura-crm')) {
      cardTitles.push('Total Leads', 'Active Deals', 'Monthly Revenue');
    }

    if (canAccessModule('neura-forms')) {
      cardTitles.push('Form Submissions', 'Active Forms');
    }

    if (canAccessModule('neura-edu')) {
      cardTitles.push('Active Students', 'Course Completion');
    }

    if (cardTitles.length === 0) {
      cardTitles.push('System Status', 'Performance');
    }

    return createRandomColorAssignment(cardTitles, sessionKey);
  }, [canAccessModule, t, sessionKey]);

  // Build metric cards with the stable color assignment
  const metricCards = useMemo(() => {
    const cards: MetricCardData[] = [];

    if (canAccessModule('neura-flow') && moduleMetrics['neura-flow']) {
      cards.push(...buildNeuraFlowMetrics(moduleMetrics['neura-flow'], t, colorAssignment));
    }

    if (canAccessModule('neura-crm') && moduleMetrics['neura-crm']) {
      cards.push(...buildNeuraCrmMetrics(moduleMetrics['neura-crm'], colorAssignment));
    }

    if (canAccessModule('neura-forms') && moduleMetrics['neura-forms']) {
      cards.push(...buildNeuraFormsMetrics(moduleMetrics['neura-forms'], colorAssignment));
    }

    if (canAccessModule('neura-edu') && moduleMetrics['neura-edu']) {
      cards.push(...buildNeuraEduMetrics(moduleMetrics['neura-edu'], colorAssignment));
    }

    if (cards.length === 0) {
      cards.push(...buildFallbackMetrics(colorAssignment));
    }

    return cards;
  }, [moduleMetrics, canAccessModule, t, colorAssignment]);

  return metricCards;
}
