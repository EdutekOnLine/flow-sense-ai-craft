
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageSquare, Send, Sparkles, FileText, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
  reportData?: any;
}

interface ReportNarrative {
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  confidence: number;
}

export default function NaturalLanguageReports() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [narratives, setNarratives] = useState<ReportNarrative[]>([]);

  const exampleQueries = [
    "Show me performance metrics for the last quarter",
    "Compare user productivity across departments",
    "Analyze workflow completion trends this month",
    "What are the bottlenecks in our processes?",
    "Generate an executive summary for this week"
  ];

  const handleGenerateReport = async () => {
    if (!query.trim()) return;

    setIsGenerating(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse = generateAIResponse(query);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        confidence: aiResponse.confidence,
        reportData: aiResponse.reportData
      };

      setChatMessages(prev => [...prev, aiMessage]);

      if (aiResponse.narrative) {
        setNarratives(prev => [...prev, aiResponse.narrative]);
      }

      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
      setQuery('');
    }
  };

  const generateAIResponse = (userQuery: string) => {
    const query = userQuery.toLowerCase();
    
    if (query.includes('performance') || query.includes('metrics')) {
      return {
        content: "I've analyzed your performance metrics for the requested period. The data shows strong overall performance with 87% completion rates across departments. Engineering leads with 94% completion, while HR shows the most room for improvement at 67%. Would you like me to dive deeper into any specific department or metric?",
        confidence: 0.92,
        reportData: {
          completionRate: 87,
          topDepartment: 'Engineering',
          improvementArea: 'HR'
        },
        narrative: {
          title: 'Performance Analysis Report',
          summary: 'Comprehensive analysis of organizational performance metrics showing strong completion rates with targeted improvement opportunities.',
          keyFindings: [
            'Overall completion rate of 87% exceeds industry benchmark',
            'Engineering department leads with 94% completion rate',
            'HR department requires attention with 67% completion rate',
            'Peak productivity observed Tuesday-Thursday',
            'Mobile workflow usage correlates with 15% faster completion'
          ],
          recommendations: [
            'Implement HR department process optimization',
            'Expand mobile workflow capabilities',
            'Schedule critical tasks during peak productivity hours',
            'Cross-train teams to balance workload distribution'
          ],
          confidence: 0.92
        }
      };
    } else if (query.includes('trend') || query.includes('month')) {
      return {
        content: "This month's trends show a positive trajectory with 12% improvement in completion rates compared to last month. The main drivers are increased automation adoption and improved team collaboration. I notice workflow volumes peak mid-week and productivity is highest in the mornings.",
        confidence: 0.89,
        reportData: {
          monthlyImprovement: 12,
          peakDays: ['Tuesday', 'Wednesday', 'Thursday']
        }
      };
    } else if (query.includes('department') || query.includes('compare')) {
      return {
        content: "Comparing departmental productivity, I see clear performance patterns. Engineering (94%) and Marketing (87%) are your top performers, while Sales (78%) and HR (67%) have optimization opportunities. The performance gaps suggest different workflow complexities and resource allocations.",
        confidence: 0.88,
        reportData: {
          rankings: [
            { dept: 'Engineering', score: 94 },
            { dept: 'Marketing', score: 87 },
            { dept: 'Sales', score: 78 },
            { dept: 'HR', score: 67 }
          ]
        }
      };
    } else if (query.includes('bottleneck') || query.includes('problem')) {
      return {
        content: "I've identified several process bottlenecks: approval delays in Finance (avg 2.3 days), resource allocation conflicts in Project Management, and communication gaps between Sales and Engineering. These issues contribute to approximately 23% of workflow delays.",
        confidence: 0.85,
        reportData: {
          bottlenecks: ['Finance approvals', 'Resource allocation', 'Cross-team communication']
        }
      };
    } else {
      return {
        content: "I can help you analyze various aspects of your workflow data. Try asking about performance metrics, trends, departmental comparisons, or process bottlenecks. I can also generate executive summaries and detailed reports based on your specific needs.",
        confidence: 0.75,
        reportData: null
      };
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('reports.naturalLanguage.title')}</h2>
        <p className="text-gray-600 mt-1">{t('reports.naturalLanguage.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('reports.naturalLanguage.chat')}
              </CardTitle>
              <CardDescription>
                Ask questions about your workflow data in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Start a conversation by asking about your workflow data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          {message.confidence && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {t('reports.naturalLanguage.confidence')}: {Math.round(message.confidence * 100)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('reports.naturalLanguage.placeholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
                  disabled={isGenerating}
                />
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !query.trim()}
                >
                  {isGenerating ? (
                    <Brain className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example Queries & Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Example Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => handleExampleQuery(example)}
                >
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Workflows</span>
                <Badge>24</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <Badge variant="secondary">87%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Top Department</span>
                <Badge variant="outline">Engineering</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Narratives */}
      {narratives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('reports.naturalLanguage.narratives')}
            </CardTitle>
            <CardDescription>
              AI-generated report narratives from your conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {narratives.map((narrative, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{narrative.title}</h3>
                    <Badge variant="outline">
                      {Math.round(narrative.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{narrative.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Key Findings</h4>
                      <ul className="text-sm space-y-1">
                        {narrative.keyFindings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {narrative.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Users className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
