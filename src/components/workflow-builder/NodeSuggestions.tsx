
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepSuggestion {
  id: string;
  label: string;
  description: string;
  stepType: string;
  reason: string;
  confidence: number;
}

interface NodeSuggestionsProps {
  suggestions: StepSuggestion[];
  position: { x: number; y: number };
  onAddSuggestion: (suggestion: StepSuggestion) => void;
  onDismiss: () => void;
}

export function NodeSuggestions({
  suggestions,
  position,
  onAddSuggestion,
  onDismiss
}: NodeSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const topSuggestion = suggestions[0]; // Show only the top suggestion inline

  return (
    <div
      className="absolute z-40 pointer-events-auto"
      style={{
        left: position.x + 20,
        top: position.y - 10,
        transform: 'translateY(-50%)'
      }}
    >
      <Card className="bg-white border-2 border-blue-200 shadow-lg p-2 w-48">
        <div className="flex items-center gap-1 mb-1">
          <Lightbulb className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-600">AI Suggestion</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-900">
              {topSuggestion.label}
            </h4>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              {Math.round(topSuggestion.confidence * 100)}%
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600">
            {topSuggestion.description}
          </p>
          
          <div className="flex gap-1 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs flex-1"
              onClick={() => onAddSuggestion(topSuggestion)}
            >
              <Plus className="h-2 w-2 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs px-2"
              onClick={onDismiss}
            >
              ×
            </Button>
          </div>
          
          {suggestions.length > 1 && (
            <p className="text-xs text-blue-600 pt-1">
              +{suggestions.length - 1} more suggestions available
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
