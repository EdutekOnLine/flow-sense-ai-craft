
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedInsight {
  id: string;
  type: 'predictive' | 'anomaly' | 'recommendation' | 'resource_optimization' | 'efficiency' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  data: any;
  timestamp: string;
  actionable: boolean;
}

export interface PredictiveAnalytics {
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  predicted_completion_rate: number;
  confidence_interval: [number, number];
  factors: string[];
  recommendation: string;
}

export interface AnomalyDetection {
  anomaly_score: number;
  affected_metrics: string[];
  potential_causes: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export function usePredictiveAnalytics(timeframe: number = 30) {
  return useQuery({
    queryKey: ['predictive-analytics', timeframe],
    queryFn: async () => {
      const { data: trends } = await supabase
        .from('workflow_trends')
        .select('*')
        .order('date', { ascending: false })
        .limit(timeframe);

      if (!trends || trends.length < 7) {
        return null;
      }

      // Calculate trend analysis
      const recentData = trends.slice(0, Math.floor(timeframe / 2));
      const olderData = trends.slice(Math.floor(timeframe / 2));

      const recentAvg = recentData.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) / recentData.length;
      const olderAvg = olderData.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) / olderData.length;

      const trendDirection = recentAvg > olderAvg * 1.05 ? 'increasing' : 
                           recentAvg < olderAvg * 0.95 ? 'decreasing' : 'stable';

      // Simple linear regression for prediction
      const x = trends.map((_, i) => i);
      const y = trends.map(t => t.workflows_completed || 0);
      const n = trends.length;
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const predictedNext = slope * n + intercept;
      const confidenceInterval: [number, number] = [
        Math.max(0, predictedNext * 0.8),
        predictedNext * 1.2
      ];

      return {
        trend_direction: trendDirection,
        predicted_completion_rate: Math.max(0, predictedNext),
        confidence_interval: confidenceInterval,
        factors: ['Recent performance trends', 'Historical patterns', 'Team capacity'],
        recommendation: trendDirection === 'increasing' 
          ? 'Maintain current practices and consider scaling successful processes'
          : trendDirection === 'decreasing'
          ? 'Investigate potential bottlenecks and consider process improvements'
          : 'Performance is stable, focus on optimization opportunities'
      } as PredictiveAnalytics;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useAnomalyDetection() {
  return useQuery({
    queryKey: ['anomaly-detection'],
    queryFn: async () => {
      const { data: trends } = await supabase
        .from('workflow_trends')
        .select('*')
        .order('date', { ascending: false })
        .limit(14);

      if (!trends || trends.length < 7) {
        return null;
      }

      const completionRates = trends.map(t => t.workflows_completed || 0);
      const mean = completionRates.reduce((sum, val) => sum + val, 0) / completionRates.length;
      const variance = completionRates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / completionRates.length;
      const stdDev = Math.sqrt(variance);

      // Detect anomalies (values more than 2 standard deviations from mean)
      const anomalies = completionRates.filter(rate => Math.abs(rate - mean) > 2 * stdDev);
      const anomalyScore = anomalies.length / completionRates.length;

      let severity: 'low' | 'medium' | 'high' = 'low';
      if (anomalyScore > 0.3) severity = 'high';
      else if (anomalyScore > 0.15) severity = 'medium';

      return {
        anomaly_score: anomalyScore,
        affected_metrics: anomalies.length > 0 ? ['Workflow Completion Rate'] : [],
        potential_causes: [
          'Seasonal variations',
          'Team availability changes',
          'Process modifications',
          'External factors'
        ],
        severity,
        recommendations: severity === 'high' 
          ? ['Immediate investigation required', 'Review recent process changes']
          : severity === 'medium'
          ? ['Monitor trends closely', 'Consider process review']
          : ['Continue regular monitoring']
      } as AnomalyDetection;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useResourceOptimization() {
  return useQuery({
    queryKey: ['resource-optimization'],
    queryFn: async () => {
      const { data: userAnalytics } = await supabase
        .from('user_performance_analytics')
        .select('*');

      if (!userAnalytics || userAnalytics.length === 0) {
        return null;
      }

      // Identify workload imbalances
      const avgWorkload = userAnalytics.reduce((sum, user) => sum + (user.steps_assigned || 0), 0) / userAnalytics.length;
      const avgCompletionRate = userAnalytics.reduce((sum, user) => sum + (user.completion_rate || 0), 0) / userAnalytics.length;

      const overloaded = userAnalytics.filter(user => 
        (user.steps_assigned || 0) > avgWorkload * 1.3 && 
        (user.completion_rate || 0) < avgCompletionRate * 0.8
      );

      const underutilized = userAnalytics.filter(user => 
        (user.steps_assigned || 0) < avgWorkload * 0.7 && 
        (user.completion_rate || 0) > avgCompletionRate * 1.1
      );

      return {
        overloaded_users: overloaded,
        underutilized_users: underutilized,
        optimization_score: 1 - (overloaded.length + underutilized.length) / userAnalytics.length,
        recommendations: [
          overloaded.length > 0 ? `Redistribute workload for ${overloaded.length} overloaded team members` : null,
          underutilized.length > 0 ? `Increase assignments for ${underutilized.length} underutilized team members` : null,
          'Implement regular workload review meetings'
        ].filter(Boolean)
      };
    },
    staleTime: 1000 * 60 * 20, // 20 minutes
  });
}
