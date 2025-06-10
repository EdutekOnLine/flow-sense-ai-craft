
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

interface NaturalLanguageInputProps {
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export interface NaturalLanguageInputRef {
  focusInput: () => void;
}

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

    // Get example queries from translation
    const exampleQueries = t('reports.exampleQueriesList', { returnObjects: true }) as string[];

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="ai-query" className={`block text-sm font-medium mb-2 ${getRTLAwareTextAlign('start')}`}>
                  {t('reports.aiQuery')}
                </label>
                <Textarea
                  ref={textareaRef}
                  id="ai-query"
                  placeholder={t('reports.aiQueryPlaceholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  className={`w-full ${getRTLAwareTextAlign('start')}`}
                  dir="auto"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!query.trim() || isLoading}
                className="w-full rtl:flex-row-reverse"
              >
                {isLoading ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${getRTLAwareIconPosition('before')}`} />
                    {t('reports.generatingReport')}
                  </>
                ) : (
                  <>
                    <Sparkles className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                    {t('reports.generateAIReport')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className={`text-sm font-medium mb-3 ${getRTLAwareTextAlign('start')}`}>
              {t('reports.exampleQueriesTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                  className={`${getRTLAwareTextAlign('start')} justify-start h-auto p-3 whitespace-normal`}
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
