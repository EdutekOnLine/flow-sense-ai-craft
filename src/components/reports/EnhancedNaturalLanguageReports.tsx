
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageSquare, Send, Sparkles, Mic, MicOff, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  confidence?: number;
  analysisType?: 'predictive' | 'anomaly' | 'recommendation' | 'standard';
  predictions?: any;
  recommendations?: string[];
}

interface ConversationContext {
  previousQueries: string[];
  userRole: string;
  department: string;
  analysisHistory: any[];
}

export default function EnhancedNaturalLanguageReports() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<ConversationContext>({
    previousQueries: [],
    userRole: 'employee',
    department: 'general',
    analysisHistory: []
  });
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition failed');
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
      // Call enhanced AI function with context
      const { data, error } = await supabase.functions.invoke('generate-enhanced-ai-response', {
        body: { 
          query, 
          context,
          includeML: true,
          includePredictions: true
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        confidence: data.confidence,
        analysisType: data.analysisType,
        predictions: data.predictions,
        recommendations: data.recommendations
      };

      setChatMessages(prev => [...prev, aiMessage]);

      // Update conversation context
      setContext(prev => ({
        ...prev,
        previousQueries: [...prev.previousQueries, query].slice(-5), // Keep last 5 queries
        analysisHistory: [...prev.analysisHistory, data].slice(-10) // Keep last 10 analyses
      }));

      toast.success('AI analysis complete!');
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate response');
    } finally {
      setIsGenerating(false);
      setQuery('');
    }
  };

  const getAnalysisIcon = (type?: string) => {
    switch (type) {
      case 'predictive':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'recommendation':
        return <Target className="h-4 w-4 text-green-500" />;
      default:
        return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const smartSuggestions = [
    "Predict next month's workflow completion rates",
    "Identify potential bottlenecks in our current processes",
    "What optimization recommendations do you have for our team?",
    "Analyze anomalies in this week's performance data",
    "Forecast resource needs for Q1 based on current trends",
    "Compare our efficiency with industry benchmarks"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Analytics Assistant</h2>
        <p className="text-gray-600 mt-1">
          Advanced conversational AI with predictive analytics and intelligent recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Chat Interface */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Intelligent Analytics Chat
              </CardTitle>
              <CardDescription>
                Ask complex questions about your data and get ML-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Start a conversation with your AI analytics assistant</p>
                    <p className="text-sm mt-1">Try asking predictive questions or requesting recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900 border'
                          }`}
                        >
                          {message.type === 'ai' && (
                            <div className="flex items-center gap-2 mb-2">
                              {getAnalysisIcon(message.analysisType)}
                              <span className="text-xs font-medium">
                                {message.analysisType === 'predictive' ? 'Predictive Analysis' :
                                 message.analysisType === 'anomaly' ? 'Anomaly Detection' :
                                 message.analysisType === 'recommendation' ? 'Smart Recommendations' :
                                 'Standard Analysis'}
                              </span>
                            </div>
                          )}
                          
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          {message.predictions && (
                            <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                              <h4 className="text-sm font-medium text-blue-800 mb-1">Predictions:</h4>
                              <pre className="text-xs text-blue-700 overflow-x-auto">
                                {JSON.stringify(message.predictions, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {message.recommendations && message.recommendations.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <h4 className="text-sm font-medium text-gray-700">Recommendations:</h4>
                              {message.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <Target className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {message.confidence && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Confidence: {Math.round(message.confidence * 100)}%
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
                  placeholder="Ask me about predictions, anomalies, or get recommendations..."
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateReport()}
                  disabled={isGenerating}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceInput}
                  disabled={isGenerating}
                  className={isListening ? 'bg-red-50 border-red-300' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
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

        {/* Smart Suggestions & Context */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {smartSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => setQuery(suggestion)}
                >
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Conversation Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Recent Queries:</span>
                <div className="mt-1 space-y-1">
                  {context.previousQueries.slice(-3).map((q, i) => (
                    <div key={i} className="text-xs text-gray-500 p-1 bg-gray-50 rounded">
                      {q.length > 40 ? q.substring(0, 40) + '...' : q}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Analyses</span>
                <Badge variant="outline">{context.analysisHistory.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
