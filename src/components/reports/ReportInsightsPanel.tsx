
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, RefreshCw } from 'lucide-react';

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'neutral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
}

interface ReportInsightsPanelProps {
  insights?: Insight[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'positive',
    title: 'Engineering Department Excellence',
    description: 'Engineering team maintains 94% completion rate, 8% above organizational average',
    impact: 'high',
    confidence: 0.92,
    actionable: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'HR Process Bottleneck',
    description: 'HR workflows show 67% completion rate with average 2.3 day delays in approval processes',
    impact: 'medium',
    confidence: 0.87,
    actionable: true
  },
  {
    id: '3',
    type: 'positive',
    title: 'Mobile Adoption Impact',
    description: 'Mobile workflow usage correlates with 15% faster completion times across all departments',
    impact: 'medium',
    confidence: 0.89,
    actionable: true
  },
  {
    id: '4',
    type: 'neutral',
    title: 'Productivity Patterns',
    description: 'Peak productivity observed Tuesday-Thursday, with 23% drop on Mondays and Fridays',
    impact: 'low',
    confidence: 0.94,
    actionable: true
  }
];

export default function ReportInsightsPanel({ 
  insights = mockInsights, 
  isLoading = false, 
  onRefresh 
}: ReportInsightsPanelProps) {
  
  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Analyzing your workflow data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Intelligent analysis of your workflow performance
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h3 className="font-medium text-sm">{insight.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getImpactColor(insight.impact)}`}
                  >
                    {insight.impact} impact
                  </Badge>
                  {insight.actionable && (
                    <Badge variant="outline" className="text-xs">
                      Actionable
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Confidence: {Math.round(insight.confidence * 100)}%
                </span>
                {insight.actionable && (
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                    View Actions →
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
