
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Users, BarChart3, Target, AlertTriangle, Sparkles } from 'lucide-react';

interface EnhancedQuerySuggestion {
  id: string;
  category: 'predictive' | 'anomaly' | 'optimization' | 'comparison' | 'realtime';
  query: string;
  description: string;
  mlCapabilities: string[];
  expectedInsights: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ReportQuerySuggestionsEnhancedProps {
  onSelectQuery: (query: string) => void;
  userRole?: string;
  department?: string;
}

const suggestions: EnhancedQuerySuggestion[] = [
  {
    id: '1',
    category: 'predictive',
    query: 'Predict our workflow completion rates for the next month based on current trends',
    description: 'ML-powered forecasting with confidence intervals and trend analysis',
    mlCapabilities: ['Time series analysis', 'Regression modeling', 'Seasonal adjustments'],
    expectedInsights: ['Monthly completion forecast', 'Trend direction', 'Capacity requirements'],
    difficulty: 'intermediate'
  },
  {
    id: '2',
    category: 'anomaly',
    query: 'Detect any unusual patterns or anomalies in our recent performance data',
    description: 'Statistical anomaly detection with root cause analysis',
    mlCapabilities: ['Statistical analysis', 'Outlier detection', 'Pattern recognition'],
    expectedInsights: ['Anomaly severity', 'Affected metrics', 'Investigation priorities'],
    difficulty: 'beginner'
  },
  {
    id: '3',
    category: 'optimization',
    query: 'What are the best resource optimization opportunities based on our current workload?',
    description: 'Intelligent workload analysis and redistribution recommendations',
    mlCapabilities: ['Resource allocation', 'Workload balancing', 'Efficiency optimization'],
    expectedInsights: ['Workload imbalances', 'Optimization score', 'Specific recommendations'],
    difficulty: 'advanced'
  },
  {
    id: '4',
    category: 'predictive',
    query: 'Will we meet our quarterly targets given current performance velocity?',
    description: 'Goal tracking with predictive modeling and risk assessment',
    mlCapabilities: ['Velocity analysis', 'Goal projection', 'Risk assessment'],
    expectedInsights: ['Target probability', 'Required velocity', 'Risk factors'],
    difficulty: 'intermediate'
  },
  {
    id: '5',
    category: 'comparison',
    query: 'Compare our department performance and identify top performers for knowledge sharing',
    description: 'Cross-departmental analysis with best practice identification',
    mlCapabilities: ['Performance clustering', 'Benchmark analysis', 'Success pattern matching'],
    expectedInsights: ['Performance rankings', 'Success factors', 'Knowledge transfer opportunities'],
    difficulty: 'beginner'
  },
  {
    id: '6',
    category: 'optimization',
    query: 'Identify automation opportunities that could save the most time and effort',
    description: 'Process mining and automation potential assessment',
    mlCapabilities: ['Process analysis', 'Automation scoring', 'ROI calculation'],
    expectedInsights: ['Automation candidates', 'Time savings potential', 'Implementation effort'],
    difficulty: 'advanced'
  },
  {
    id: '7',
    category: 'realtime',
    query: 'What real-time insights can you provide about our current workflow health?',
    description: 'Live performance monitoring with immediate actionable insights',
    mlCapabilities: ['Real-time analysis', 'Health scoring', 'Alert generation'],
    expectedInsights: ['Current health status', 'Immediate actions', 'Performance alerts'],
    difficulty: 'beginner'
  },
  {
    id: '8',
    category: 'predictive',
    query: 'Forecast potential bottlenecks and capacity issues for the next quarter',
    description: 'Capacity planning with bottleneck prediction and mitigation strategies',
    mlCapabilities: ['Capacity modeling', 'Bottleneck prediction', 'Resource planning'],
    expectedInsights: ['Capacity forecasts', 'Bottleneck predictions', 'Mitigation strategies'],
    difficulty: 'advanced'
  }
];

export default function ReportQuerySuggestionsEnhanced({ 
  onSelectQuery, 
  userRole = 'employee', 
  department = 'general' 
}: ReportQuerySuggestionsEnhancedProps) {
  
  const getCategoryIcon = (category: EnhancedQuerySuggestion['category']) => {
    switch (category) {
      case 'predictive':
        return <TrendingUp className="h-4 w-4" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      case 'optimization':
        return <Target className="h-4 w-4" />;
      case 'comparison':
        return <Users className="h-4 w-4" />;
      case 'realtime':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: EnhancedQuerySuggestion['category']) => {
    switch (category) {
      case 'predictive':
        return 'bg-blue-100 text-blue-800';
      case 'anomaly':
        return 'bg-orange-100 text-orange-800';
      case 'optimization':
        return 'bg-green-100 text-green-800';
      case 'comparison':
        return 'bg-purple-100 text-purple-800';
      case 'realtime':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: EnhancedQuerySuggestion['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter suggestions based on user role and difficulty
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (userRole === 'employee' && suggestion.difficulty === 'advanced') {
      return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI-Powered Query Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => onSelectQuery(suggestion.query)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(suggestion.category)}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(suggestion.category)}`}
                  >
                    {suggestion.category}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}
                >
                  {suggestion.difficulty}
                </Badge>
              </div>
              
              <h3 className="font-medium text-sm mb-2 group-hover:text-blue-600 transition-colors">
                {suggestion.query}
              </h3>
              
              <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-700">ML Capabilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestion.mlCapabilities.map((capability, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-medium text-gray-700">Expected Insights:</span>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    {suggestion.expectedInsights.slice(0, 2).map((insight, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        {insight}
                      </li>
                    ))}
                    {suggestion.expectedInsights.length > 2 && (
                      <li className="text-gray-500">
                        +{suggestion.expectedInsights.length - 2} more insights...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI Assistant Tip</span>
          </div>
          <p className="text-xs text-blue-700">
            These suggestions are powered by machine learning and tailored to your role as {userRole} in the {department} department. 
            The AI can provide increasingly sophisticated insights as you explore more advanced queries.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
