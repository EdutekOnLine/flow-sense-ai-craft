
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

  const metricCards = useMemo(() => {
    const cards: MetricCardData[] = [];
    const cardTitles: string[] = [];

    // Collect all card titles first to create consistent color assignment
    if (canAccessModule('neura-flow') && moduleMetrics['neura-flow']) {
      cardTitles.push(
        t('dashboard.pendingTasks'),
        t('dashboard.activeTasks'),
        t('dashboard.completedToday')
      );
    }

    if (canAccessModule('neura-crm') && moduleMetrics['neura-crm']) {
      cardTitles.push('Total Leads', 'Active Deals', 'Monthly Revenue');
    }

    if (canAccessModule('neura-forms') && moduleMetrics['neura-forms']) {
      cardTitles.push('Form Submissions', 'Active Forms');
    }

    if (canAccessModule('neura-edu') && moduleMetrics['neura-edu']) {
      cardTitles.push('Active Students', 'Course Completion');
    }

    if (cardTitles.length === 0) {
      cardTitles.push('System Status', 'Performance');
    }

    // Generate random color assignment based on current timestamp to refresh on each dashboard load
    const sessionKey = Math.floor(Date.now() / (1000 * 60 * 5)); // Changes every 5 minutes
    const colorAssignment = createRandomColorAssignment(cardTitles);

    // Build cards with random colors
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
  }, [moduleMetrics, canAccessModule, t]);

  return metricCards;
}
