
import React from 'react';
import { useModuleDashboardData } from '@/hooks/useModuleDashboardData';
import { MetricCard } from './metrics/MetricCard';
import { MetricCardSkeleton } from './metrics/MetricCardSkeleton';
import { useMetricCards } from './metrics/useMetricCards';

export function ModuleMetricsCards() {
  const { data, isLoading } = useModuleDashboardData();
  const metricCards = useMetricCards(data.moduleMetrics);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metricCards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  );
}
