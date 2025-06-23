
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
    // Always include ALL possible card titles regardless of module access
    const cardTitles: string[] = [
      // NeuraFlow titles
      t('dashboard.pendingTasks'),
      t('dashboard.activeTasks'),
      t('dashboard.completedToday'),
      // NeuraCRM titles
      'Total Leads',
      'Active Deals',
      'Monthly Revenue',
      // NeuraForms titles
      'Form Submissions',
      'Active Forms',
      // NeuraEdu titles
      'Active Students',
      'Course Completion',
      // Fallback titles
      'System Status',
      'Performance'
    ];

    const assignment = createRandomColorAssignment(cardTitles, sessionKey);
    console.log('🎨 [useMetricCards] Generated color assignment for ALL titles:', cardTitles);
    console.log('🎨 [useMetricCards] Color assignment result:', assignment);
    console.log('🎨 [useMetricCards] Session key:', sessionKey);
    
    // Check specific problematic cards
    console.log('🎨 [useMetricCards] Active Deals color:', assignment['Active Deals']);
    console.log('🎨 [useMetricCards] Course Completion color:', assignment['Course Completion']);
    
    return assignment;
  }, [t, sessionKey]); // Removed canAccessModule dependency

  // Build metric cards with the stable color assignment
  const metricCards = useMemo(() => {
    const cards: MetricCardData[] = [];

    console.log('🎨 [useMetricCards] Building cards with moduleMetrics:', moduleMetrics);
    console.log('🎨 [useMetricCards] Available modules:', Object.keys(moduleMetrics || {}));

    if (canAccessModule('neura-flow') && moduleMetrics['neura-flow']) {
      const flowCards = buildNeuraFlowMetrics(moduleMetrics['neura-flow'], t, colorAssignment);
      console.log('🎨 [useMetricCards] NeuraFlow cards with colors:', flowCards);
      cards.push(...flowCards);
    }

    if (canAccessModule('neura-crm') && moduleMetrics['neura-crm']) {
      const crmCards = buildNeuraCrmMetrics(moduleMetrics['neura-crm'], colorAssignment);
      console.log('🎨 [useMetricCards] NeuraCRM cards with colors:', crmCards);
      console.log('🎨 [useMetricCards] Active Deals card specifically:', crmCards.find(c => c.title === 'Active Deals'));
      cards.push(...crmCards);
    }

    if (canAccessModule('neura-forms') && moduleMetrics['neura-forms']) {
      const formsCards = buildNeuraFormsMetrics(moduleMetrics['neura-forms'], colorAssignment);
      console.log('🎨 [useMetricCards] NeuraForms cards with colors:', formsCards);
      cards.push(...formsCards);
    }

    if (canAccessModule('neura-edu') && moduleMetrics['neura-edu']) {
      const eduCards = buildNeuraEduMetrics(moduleMetrics['neura-edu'], colorAssignment);
      console.log('🎨 [useMetricCards] NeuraEdu cards with colors:', eduCards);
      console.log('🎨 [useMetricCards] Course Completion card specifically:', eduCards.find(c => c.title === 'Course Completion'));
      cards.push(...eduCards);
    }

    if (cards.length === 0) {
      const fallbackCards = buildFallbackMetrics(colorAssignment);
      console.log('🎨 [useMetricCards] Fallback cards with colors:', fallbackCards);
      cards.push(...fallbackCards);
    }

    console.log('🎨 [useMetricCards] Final metric cards count:', cards.length);
    console.log('🎨 [useMetricCards] Final metric cards titles:', cards.map(c => c.title));
    return cards;
  }, [moduleMetrics, canAccessModule, t, colorAssignment]);

  return metricCards;
}
