
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Brain, CheckCircle, Clock, Users, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Recommendation {
  id: string;
  type: 'process' | 'resource' | 'workflow' | 'automation' | 'training';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  confidence: number;
  potentialBenefit: string;
  implementation: string[];
  metrics: {
    efficiency_gain: number;
    time_saved: string;
    cost_reduction: string;
  };
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'automation',
    priority: 'high',
    title: 'Automate Approval Process for Low-Value Transactions',
    description: 'Implement automated approval for transactions under $500 to reduce bottlenecks in Finance department',
    impact: 'Reduce approval time by 67% and free up 8 hours/week of manual work',
    effort: 'medium',
    timeframe: '2-3 weeks',
    confidence: 0.94,
    potentialBenefit: '$2,400/month in productivity savings',
    implementation: [
      'Configure automated rules in workflow system',
      'Set up notification system for stakeholders',
      'Implement audit trail for automated approvals',
      'Train team on new process'
    ],
    metrics: {
      efficiency_gain: 67,
      time_saved: '8 hours/week',
      cost_reduction: '$2,400/month'
    },
    status: 'new'
  },
  {
    id: '2',
    type: 'resource',
    priority: 'high',
    title: 'Redistribute Workload Between Teams',
    description: 'Engineering team has 15% capacity while Marketing is overloaded by 23%',
    impact: 'Balance workload distribution and improve overall team satisfaction',
    effort: 'low',
    timeframe: '1 week',
    confidence: 0.87,
    potentialBenefit: '20% improvement in completion rates',
    implementation: [
      'Identify transferable tasks between teams',
      'Cross-train Engineering team on Marketing processes',
      'Gradually redistribute 3-4 workflows per week',
      'Monitor impact and adjust as needed'
    ],
    metrics: {
      efficiency_gain: 20,
      time_saved: '12 hours/week',
      cost_reduction: '15% stress reduction'
    },
    status: 'new'
  },
  {
    id: '3',
    type: 'process',
    priority: 'medium',
    title: 'Optimize Meeting-Heavy Workflows',
    description: 'Workflows requiring 3+ meetings show 40% longer completion times',
    impact: 'Streamline communication and reduce time-to-completion',
    effort: 'low',
    timeframe: '2 weeks',
    confidence: 0.82,
    potentialBenefit: '25% reduction in workflow duration',
    implementation: [
      'Identify workflows with excessive meeting requirements',
      'Replace status meetings with async updates',
      'Implement decision-making frameworks',
      'Create meeting-optional workflow variants'
    ],
    metrics: {
      efficiency_gain: 25,
      time_saved: '6 hours/week',
      cost_reduction: '$1,200/month'
    },
    status: 'in_progress'
  },
  {
    id: '4',
    type: 'training',
    priority: 'medium',
    title: 'Implement Mobile Workflow Training',
    description: 'Teams using mobile workflows complete tasks 15% faster',
    impact: 'Increase mobile adoption from 35% to 80% across organization',
    effort: 'medium',
    timeframe: '3-4 weeks',
    confidence: 0.79,
    potentialBenefit: '15% overall speed improvement',
    implementation: [
      'Develop mobile workflow training materials',
      'Schedule department-wise training sessions',
      'Create mobile-first workflow guides',
      'Provide ongoing support and feedback collection'
    ],
    metrics: {
      efficiency_gain: 15,
      time_saved: '4 hours/week',
      cost_reduction: '$800/month'
    },
    status: 'new'
  }
];

export default function IntelligentRecommendationsEngine() {
  const [recommendations, setRecommendations] = useState(mockRecommendations);
  const [selectedType, setSelectedType] = useState<string>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'automation':
        return <Brain className="h-4 w-4" />;
      case 'resource':
        return <Users className="h-4 w-4" />;
      case 'process':
        return <TrendingUp className="h-4 w-4" />;
      case 'training':
        return <Lightbulb className="h-4 w-4" />;
      case 'workflow':
        return <Target className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high':
        return 'bg-red-50 text-red-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'low':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImplement = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, status: 'in_progress' as const } : rec
      )
    );
    toast.success('Recommendation marked as in progress');
  };

  const handleDismiss = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, status: 'dismissed' as const } : rec
      )
    );
    toast.info('Recommendation dismissed');
  };

  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedType);

  const typeFilters = [
    { value: 'all', label: 'All Recommendations', count: recommendations.length },
    { value: 'automation', label: 'Automation', count: recommendations.filter(r => r.type === 'automation').length },
    { value: 'resource', label: 'Resource', count: recommendations.filter(r => r.type === 'resource').length },
    { value: 'process', label: 'Process', count: recommendations.filter(r => r.type === 'process').length },
    { value: 'training', label: 'Training', count: recommendations.filter(r => r.type === 'training').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Intelligent Recommendations Engine</h2>
        <p className="text-gray-600 mt-1">
          AI-powered optimization suggestions based on your workflow patterns and performance data
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {typeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedType === filter.value ? 'default' : 'outline'}
            onClick={() => setSelectedType(filter.value)}
            className="flex items-center gap-2"
          >
            {filter.label}
            <Badge variant="secondary" className="ml-1">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(recommendation.type)}
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(recommendation.priority)}>
                    {recommendation.priority} priority
                  </Badge>
                  <Badge className={getStatusColor(recommendation.status)}>
                    {recommendation.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <CardDescription>{recommendation.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Impact & Metrics */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Expected Impact</h4>
                <p className="text-sm text-blue-800 mb-3">{recommendation.impact}</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-blue-600 font-medium">Efficiency</span>
                    <p className="font-semibold">+{recommendation.metrics.efficiency_gain}%</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Time Saved</span>
                    <p className="font-semibold">{recommendation.metrics.time_saved}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Benefit</span>
                    <p className="font-semibold">{recommendation.metrics.cost_reduction}</p>
                  </div>
                </div>
              </div>

              {/* Implementation Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Implementation Steps</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recommendation.implementation.slice(0, 3).map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                  {recommendation.implementation.length > 3 && (
                    <li className="text-xs text-gray-500 ml-6">
                      +{recommendation.implementation.length - 3} more steps...
                    </li>
                  )}
                </ul>
              </div>

              {/* Effort & Timeline */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Effort Level</span>
                    <Badge variant="outline" className={getEffortColor(recommendation.effort)}>
                      {recommendation.effort}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Timeline</span>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Clock className="h-3 w-3" />
                      {recommendation.timeframe}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Confidence</span>
                  <div className="flex items-center gap-2">
                    <Progress value={recommendation.confidence * 100} className="w-16 h-2" />
                    <span className="text-sm font-medium">{Math.round(recommendation.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {recommendation.status === 'new' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    onClick={() => handleImplement(recommendation.id)}
                    className="flex-1"
                  >
                    Start Implementation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDismiss(recommendation.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {recommendation.status === 'in_progress' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <Clock className="h-4 w-4" />
                    Implementation in progress...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No recommendations available for the selected filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
