
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

export function useMetricCards(moduleMetrics: Record<string, any>) {
  const { canAccessModule } = useModulePermissions();
  const { t } = useTranslation();

  const metricCards = useMemo(() => {
    const cards: MetricCardData[] = [];

    // NeuraFlow metrics
    if (canAccessModule('neura-flow') && moduleMetrics['neura-flow']) {
      cards.push(...buildNeuraFlowMetrics(moduleMetrics['neura-flow'], t));
    }

    // NeuraCRM metrics
    if (canAccessModule('neura-crm') && moduleMetrics['neura-crm']) {
      cards.push(...buildNeuraCrmMetrics(moduleMetrics['neura-crm']));
    }

    // NeuraForms metrics
    if (canAccessModule('neura-forms') && moduleMetrics['neura-forms']) {
      cards.push(...buildNeuraFormsMetrics(moduleMetrics['neura-forms']));
    }

    // NeuraEdu metrics
    if (canAccessModule('neura-edu') && moduleMetrics['neura-edu']) {
      cards.push(...buildNeuraEduMetrics(moduleMetrics['neura-edu']));
    }

    // Fallback metrics if no modules
    if (cards.length === 0) {
      cards.push(...buildFallbackMetrics());
    }

    return cards;
  }, [moduleMetrics, canAccessModule, t]);

  return metricCards;
}
