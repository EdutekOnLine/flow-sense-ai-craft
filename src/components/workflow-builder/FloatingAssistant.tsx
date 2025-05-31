
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepSuggestion {
  id: string;
  label: string;
  description: string;
  stepType: string;
  reason: string;
  confidence: number;
}

interface FloatingAssistantProps {
  suggestions: StepSuggestion[];
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
  onAddSuggestion: (suggestion: StepSuggestion) => void;
  selectedNodeLabel?: string;
}

export function FloatingAssistant({
  suggestions,
  isLoading,
  isVisible,
  onClose,
  onAddSuggestion,
  selectedNodeLabel
}: FloatingAssistantProps) {
  if (!isVisible) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className="shadow-lg border-2 border-blue-200 bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {selectedNodeLabel && (
            <p className="text-xs text-gray-600">
              Suggestions for: <span className="font-medium">{selectedNodeLabel}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Analyzing workflow...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <p className="text-xs text-gray-600 mb-2">
                Recommended next steps:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border rounded-lg p-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {suggestion.label}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getConfidenceColor(suggestion.confidence))}
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {suggestion.description}
                    </p>
                    <p className="text-xs text-blue-600 mb-2">
                      {suggestion.reason}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => onAddSuggestion(suggestion)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Step
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Select a node to see AI suggestions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
