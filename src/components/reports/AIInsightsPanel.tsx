
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIInsight } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'department':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'organization':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'personal':
        return 'bg-green-100 text-green-800';
      case 'department':
        return 'bg-blue-100 text-blue-800';
      case 'organization':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_active: false })
        .eq('id', insightId);

      if (error) throw error;
      
      toast.success('Insight dismissed');
      // The parent component should refetch insights
    } catch (error) {
      console.error('Error dismissing insight:', error);
      toast.error('Failed to dismiss insight');
    }
  };

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Smart analytics and recommendations based on your workflow data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start justify-between p-4 bg-white rounded-lg shadow-sm border"
            >
              <div className="flex items-start gap-3 flex-1">
                {getInsightIcon(insight.insight_type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <Badge
                      variant="secondary"
                      className={getInsightTypeColor(insight.insight_type)}
                    >
                      {insight.insight_type}
                    </Badge>
                    <span
                      className={`text-sm font-medium ${getConfidenceColor(insight.confidence_score)}`}
                    >
                      {Math.round(insight.confidence_score * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.data && (
                    <div className="mt-2 text-xs text-gray-500">
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(insight.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissInsight(insight.id)}
                className="ml-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
