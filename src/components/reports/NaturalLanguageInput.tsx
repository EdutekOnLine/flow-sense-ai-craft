
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

interface NaturalLanguageInputProps {
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export interface NaturalLanguageInputRef {
  focusInput: () => void;
}

const exampleQueries = [
  "Show me all completed workflows by department this month",
  "List users with completion rates above 80%",
  "Display overdue tasks grouped by assigned user", 
  "Generate a report of workflow trends over the last 30 days",
  "Show me the top performing departments by completion rate",
  "List all pending notifications for managers",
  "Display workflow steps that took longer than estimated",
  "Show user performance metrics for the engineering department"
];

export const NaturalLanguageInput = forwardRef<NaturalLanguageInputRef, NaturalLanguageInputProps>(
  ({ onQuerySubmit, isLoading }, ref) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onQuerySubmit(query.trim());
      }
    };

    const handleExampleClick = (example: string) => {
      setQuery(example);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="ai-query" className="block text-sm font-medium mb-2">
                  {t('reports.aiQuery')}
                </label>
                <Textarea
                  ref={textareaRef}
                  id="ai-query"
                  placeholder={t('reports.aiQueryPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!query.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('reports.generatingReport')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('reports.generateAIReport')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-3">{t('reports.exampleQueries')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                  className="text-left justify-start h-auto p-3 whitespace-normal"
                  disabled={isLoading}
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

NaturalLanguageInput.displayName = 'NaturalLanguageInput';
