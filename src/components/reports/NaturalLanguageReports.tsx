
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Brain, TrendingUp, AlertCircle, FileText, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneratedNarrative {
  id: string;
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  confidence: number;
  timestamp: Date;
}

export default function NaturalLanguageReports() {
  const { t } = useTranslation();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I can help you understand your workflow data. Ask me questions like "Why did completion rates drop last week?" or "Show me the top performing departments."',
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [narratives] = useState<GeneratedNarrative[]>([
    {
      id: '1',
      title: 'Weekly Performance Summary',
      summary: 'This week showed significant improvement in workflow completion rates, with Engineering department leading the charge at 94% completion rate. The implementation of new automation tools appears to be driving efficiency gains across all departments.',
      keyFindings: [
        'Overall completion rate increased by 12% compared to last week',
        'Engineering department achieved 94% completion rate (highest)',
        'Average task completion time decreased by 8 minutes',
        'New automation tools reduced manual errors by 23%'
      ],
      recommendations: [
        'Expand automation tools to Marketing and Sales departments',
        'Investigate HR department bottlenecks causing 67% completion rate',
        'Schedule training sessions for teams with completion rates below 80%'
      ],
      confidence: 0.92,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Anomaly Detection Alert',
      summary: 'An unusual pattern has been detected in the approval workflow process. Approval times have increased by 45% over the past 3 days, primarily affecting the Finance department workflows.',
      keyFindings: [
        'Approval times increased from 2.3 hours to 3.4 hours average',
        'Finance department most affected with 67% longer approval times',
        'Peak delays occurring between 2-4 PM daily',
        'No corresponding increase in approval volumes detected'
      ],
      recommendations: [
        'Review Finance department approver availability during peak hours',
        'Consider implementing backup approver system',
        'Investigate potential system performance issues'
      ],
      confidence: 0.87,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    }
  ]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Based on your query about "${currentMessage}", I can see that workflow performance has been trending upward this month. The completion rate increased by 15% compared to last month, with the Engineering department leading at 94% completion rate. Would you like me to dive deeper into any specific aspect?`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Report Insights</h2>
        <p className="text-gray-600 mt-1">Natural language analysis and interactive report conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generated Narratives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Report Narratives
            </CardTitle>
            <CardDescription>
              AI-generated insights and summaries from your workflow data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {narratives.map((narrative) => (
                  <div key={narrative.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">{narrative.title}</h4>
                      <Badge className={getConfidenceColor(narrative.confidence)}>
                        {Math.round(narrative.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {narrative.summary}
                    </p>
                    
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Key Findings
                      </h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {narrative.keyFindings.slice(0, 2).map((finding, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-500 mt-1">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Recommendations
                      </h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {narrative.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-green-500 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Generated {narrative.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Interactive Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interactive Report Chat
            </CardTitle>
            <CardDescription>
              Ask questions about your reports and get instant AI-powered answers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 animate-spin" />
                        Analyzing your data...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your workflow data..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isProcessing || !currentMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              Try asking: "Why did performance drop last week?" or "Show me top performing departments"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
