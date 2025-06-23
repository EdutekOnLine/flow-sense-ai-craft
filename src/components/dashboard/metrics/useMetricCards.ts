
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

  // Collect ALL possible card titles and create comprehensive color assignment
  const colorAssignment = useMemo(() => {
    const cardTitles: string[] = [];

    // Always include all possible card titles to ensure comprehensive coverage
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

    // Add fallback titles if no modules are accessible
    if (cardTitles.length === 0) {
      cardTitles.push('System Status', 'Performance');
    }

    const assignment = createRandomColorAssignment(cardTitles, sessionKey);
    console.log('🎨 Generated color assignment for titles:', cardTitles);
    console.log('🎨 Color assignment result:', assignment);
    
    return assignment;
  }, [canAccessModule, t, sessionKey]);

  // Build metric cards with the stable color assignment
  const metricCards = useMemo(() => {
    const cards: MetricCardData[] = [];

    if (canAccessModule('neura-flow') && moduleMetrics['neura-flow']) {
      const flowCards = buildNeuraFlowMetrics(moduleMetrics['neura-flow'], t, colorAssignment);
      console.log('🎨 NeuraFlow cards with colors:', flowCards);
      cards.push(...flowCards);
    }

    if (canAccessModule('neura-crm') && moduleMetrics['neura-crm']) {
      const crmCards = buildNeuraCrmMetrics(moduleMetrics['neura-crm'], colorAssignment);
      console.log('🎨 NeuraCRM cards with colors:', crmCards);
      cards.push(...crmCards);
    }

    if (canAccessModule('neura-forms') && moduleMetrics['neura-forms']) {
      const formsCards = buildNeuraFormsMetrics(moduleMetrics['neura-forms'], colorAssignment);
      console.log('🎨 NeuraForms cards with colors:', formsCards);
      cards.push(...formsCards);
    }

    if (canAccessModule('neura-edu') && moduleMetrics['neura-edu']) {
      const eduCards = buildNeuraEduMetrics(moduleMetrics['neura-edu'], colorAssignment);
      console.log('🎨 NeuraEdu cards with colors:', eduCards);
      cards.push(...eduCards);
    }

    if (cards.length === 0) {
      const fallbackCards = buildFallbackMetrics(colorAssignment);
      console.log('🎨 Fallback cards with colors:', fallbackCards);
      cards.push(...fallbackCards);
    }

    console.log('🎨 Final metric cards:', cards);
    return cards;
  }, [moduleMetrics, canAccessModule, t, colorAssignment]);

  return metricCards;
}
