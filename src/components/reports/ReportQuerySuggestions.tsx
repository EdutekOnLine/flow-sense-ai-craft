
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Users, BarChart3, Clock, Target } from 'lucide-react';

interface QuerySuggestion {
  id: string;
  category: 'performance' | 'trends' | 'departments' | 'efficiency' | 'goals';
  query: string;
  description: string;
  estimatedTime: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
}

interface ReportQuerySuggestionsProps {
  onSelectQuery: (query: string) => void;
}

const suggestions: QuerySuggestion[] = [
  {
    id: '1',
    category: 'performance',
    query: 'Which departments are underperforming this quarter?',
    description: 'Identify departments with completion rates below average',
    estimatedTime: '30s',
    complexity: 'simple'
  },
  {
    id: '2',
    category: 'trends',
    query: 'Show me workflow completion trends over the last 6 months',
    description: 'Analyze long-term performance patterns and seasonality',
    estimatedTime: '45s',
    complexity: 'intermediate'
  },
  {
    id: '3',
    category: 'departments',
    query: 'Compare productivity between Engineering and Marketing teams',
    description: 'Cross-departmental analysis with detailed metrics',
    estimatedTime: '40s',
    complexity: 'intermediate'
  },
  {
    id: '4',
    category: 'efficiency',
    query: 'What are the main bottlenecks slowing down our processes?',
    description: 'Identify workflow blockers and optimization opportunities',
    estimatedTime: '60s',
    complexity: 'advanced'
  },
  {
    id: '5',
    category: 'goals',
    query: 'Are we on track to meet our Q4 completion targets?',
    description: 'Goal tracking and predictive analysis',
    estimatedTime: '50s',
    complexity: 'advanced'
  },
  {
    id: '6',
    category: 'performance',
    query: 'Show me top performing users and their success patterns',
    description: 'Individual performance analysis and best practices',
    estimatedTime: '35s',
    complexity: 'simple'
  }
];

export default function ReportQuerySuggestions({ onSelectQuery }: ReportQuerySuggestionsProps) {
  const getCategoryIcon = (category: QuerySuggestion['category']) => {
    switch (category) {
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'trends':
        return <TrendingUp className="h-4 w-4" />;
      case 'departments':
        return <Users className="h-4 w-4" />;
      case 'efficiency':
        return <Target className="h-4 w-4" />;
      case 'goals':
        return <Clock className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: QuerySuggestion['category']) => {
    switch (category) {
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'trends':
        return 'bg-green-100 text-green-800';
      case 'departments':
        return 'bg-purple-100 text-purple-800';
      case 'efficiency':
        return 'bg-orange-100 text-orange-800';
      case 'goals':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: QuerySuggestion['complexity']) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Suggested Queries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
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
                <div className="flex gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getComplexityColor(suggestion.complexity)}`}
                  >
                    {suggestion.complexity}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ~{suggestion.estimatedTime}
                  </Badge>
                </div>
              </div>
              
              <h3 className="font-medium text-sm mb-1 group-hover:text-blue-600 transition-colors">
                {suggestion.query}
              </h3>
              
              <p className="text-xs text-gray-600">{suggestion.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Pro Tip</span>
          </div>
          <p className="text-xs text-blue-700">
            Try asking follow-up questions after each response to dive deeper into specific areas of interest.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
