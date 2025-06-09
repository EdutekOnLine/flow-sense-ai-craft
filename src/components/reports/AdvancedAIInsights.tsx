
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Users, 
  Clock, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { AIInsight } from '@/hooks/useAnalytics';

interface AdvancedAIInsightsProps {
  insights: AIInsight[];
}

export default function AdvancedAIInsights({ insights }: AdvancedAIInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'predictive':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'resource_optimization':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'efficiency':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'pattern':
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      default:
        return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'predictive':
        return 'Predictive Analysis';
      case 'anomaly':
        return 'Anomaly Detection';
      case 'recommendation':
        return 'Recommendation';
      case 'resource_optimization':
        return 'Resource Optimization';
      case 'efficiency':
        return 'Efficiency Analysis';
      case 'pattern':
        return 'Pattern Recognition';
      default:
        return 'AI Insight';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'predictive':
        return 'bg-blue-50 border-blue-200';
      case 'anomaly':
        return 'bg-orange-50 border-orange-200';
      case 'recommendation':
        return 'bg-yellow-50 border-yellow-200';
      case 'resource_optimization':
        return 'bg-green-50 border-green-200';
      case 'efficiency':
        return 'bg-purple-50 border-purple-200';
      case 'pattern':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.insight_type]) {
      acc[insight.insight_type] = [];
    }
    acc[insight.insight_type].push(insight);
    return acc;
  }, {} as Record<string, AIInsight[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Advanced AI Analytics</h3>
          <p className="text-sm text-gray-600">AI-powered insights and recommendations for your workflows</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {insights.length} Active Insights
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedInsights).map(([type, typeInsights]) => (
          <Card key={type} className={`${getTypeColor(type)} border transition-all hover:shadow-md`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(type)}
                  <CardTitle className="text-sm font-medium">
                    {getInsightTypeLabel(type)}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {typeInsights.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {typeInsights.slice(0, 2).map((insight) => (
                <div key={insight.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-gray-900 leading-tight">
                      {insight.title}
                    </h4>
                    <Badge 
                      className={`text-xs ${getConfidenceColor(insight.confidence_score)} border`}
                    >
                      {Math.round(insight.confidence_score * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {insight.description.substring(0, 120)}
                    {insight.description.length > 120 && '...'}
                  </p>
                  
                  {/* Display relevant data points */}
                  {insight.data && (
                    <div className="mt-2 space-y-1">
                      {type === 'predictive' && insight.data.trend && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {insight.data.trend === 'increasing' ? 
                            <TrendingUp className="h-3 w-3 text-green-500" /> : 
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          }
                          <span>{insight.data.change_percent?.toFixed(1)}% change</span>
                        </div>
                      )}
                      
                      {type === 'anomaly' && insight.data.anomalies && (
                        <div className="text-xs text-gray-500">
                          {insight.data.anomalies} anomalous day(s) detected
                        </div>
                      )}
                      
                      {type === 'resource_optimization' && insight.data.overutilized && (
                        <div className="text-xs text-gray-500">
                          {insight.data.overutilized.length} overloaded, {insight.data.underutilized.length} available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {typeInsights.length > 2 && (
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View {typeInsights.length - 2} more insights
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {insights.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Brain className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Available</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Generate AI insights to see predictive analytics, anomaly detection, and smart recommendations for your workflows.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
