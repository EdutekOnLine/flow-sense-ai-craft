
import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Edit, Lightbulb, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { WorkflowSuggestion } from '@/hooks/useWorkflowReviewer';

interface WorkflowReviewProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: WorkflowSuggestion[];
  isLoading: boolean;
  workflowName?: string;
  onApplySuggestion: (suggestion: WorkflowSuggestion) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'medium':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'low':
      return <Lightbulb className="h-4 w-4 text-blue-500" />;
  }
};

const getTypeIcon = (type: WorkflowSuggestion['type']) => {
  switch (type) {
    case 'redundancy':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'missing_branch':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'performance':
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case 'optimization':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'best_practice':
      return <Lightbulb className="h-4 w-4 text-blue-500" />;
  }
};

const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export function WorkflowReview({
  isOpen,
  onClose,
  suggestions,
  isLoading,
  workflowName,
  onApplySuggestion,
  onDismissSuggestion
}: WorkflowReviewProps) {
  const { toast } = useToast();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const handleApply = (suggestion: WorkflowSuggestion) => {
    onApplySuggestion(suggestion);
    toast({
      title: "Suggestion Applied",
      description: `Applied: ${suggestion.title}`,
    });
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    onDismissSuggestion(suggestionId);
    toast({
      title: "Suggestion Dismissed",
      description: "Suggestion has been dismissed.",
    });
  };

  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));
  const criticalSuggestions = activeSuggestions.filter(s => s.severity === 'high');
  const improvementSuggestions = activeSuggestions.filter(s => s.severity !== 'high');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">
              Workflow Review
              {workflowName && <span className="text-gray-500 ml-2">- {workflowName}</span>}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing workflow...</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              {activeSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Great Work!
                  </h3>
                  <p className="text-gray-600">
                    Your workflow looks good. No critical issues or improvements detected.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Review Summary</h3>
                    <div className="flex gap-4 text-sm">
                      <span>
                        <strong>{criticalSuggestions.length}</strong> critical issues
                      </span>
                      <span>
                        <strong>{improvementSuggestions.length}</strong> improvements
                      </span>
                      <span>
                        <strong>{activeSuggestions.reduce((sum, s) => sum + s.confidence, 0) / activeSuggestions.length * 100 | 0}%</strong> avg confidence
                      </span>
                    </div>
                  </div>

                  {/* Critical Issues */}
                  {criticalSuggestions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-red-700 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Critical Issues ({criticalSuggestions.length})
                      </h3>
                      <div className="space-y-4">
                        {criticalSuggestions.map((suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApply={handleApply}
                            onDismiss={handleDismiss}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {improvementSuggestions.length > 0 && (
                    <div>
                      {criticalSuggestions.length > 0 && <Separator className="my-6" />}
                      <h3 className="font-medium text-blue-700 mb-4 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggested Improvements ({improvementSuggestions.length})
                      </h3>
                      <div className="space-y-4">
                        {improvementSuggestions.map((suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApply={handleApply}
                            onDismiss={handleDismiss}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              AI-powered workflow analysis • Review suggestions carefully before applying
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  onApply,
  onDismiss
}: {
  suggestion: WorkflowSuggestion;
  onApply: (suggestion: WorkflowSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getTypeIcon(suggestion.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{suggestion.title}</h4>
              <Badge className={getSeverityColor(suggestion.severity)}>
                {suggestion.severity}
              </Badge>
              <Badge variant="outline">
                {(suggestion.confidence * 100).toFixed(0)}% confident
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
            <p className="text-xs text-gray-500">{suggestion.reasoning}</p>
          </div>
        </div>
        {getSeverityIcon(suggestion.severity)}
      </div>

      <div className="bg-blue-50 rounded p-3">
        <p className="text-sm font-medium text-blue-800 mb-1">Suggested Action:</p>
        <p className="text-sm text-blue-700">{suggestion.suggestedAction.details}</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDismiss(suggestion.id)}
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={() => onApply(suggestion)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Apply Fix
        </Button>
      </div>
    </div>
  );
}
