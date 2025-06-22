
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Settings } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';
import { ModuleExampleQueryGenerator, ExampleQuery } from '@/utils/moduleExampleQueries';

interface NaturalLanguageInputProps {
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
  activeModules: string[];
  isRootUser: boolean;
}

export interface NaturalLanguageInputRef {
  focusInput: () => void;
}

export const NaturalLanguageInput = forwardRef<NaturalLanguageInputRef, NaturalLanguageInputProps>(
  ({ onQuerySubmit, isLoading, activeModules, isRootUser }, ref) => {
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

    const handleExampleClick = (example: ExampleQuery) => {
      setQuery(example.text);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    // Get dynamic example queries based on active modules
    const exampleQueries = ModuleExampleQueryGenerator.getExampleQueries(
      activeModules, 
      isRootUser, 
      8
    );

    const getModuleBadgeColor = (moduleId: string) => {
      const colors: Record<string, string> = {
        'neura-core': 'bg-blue-100 text-blue-800 border-blue-200',
        'neura-flow': 'bg-purple-100 text-purple-800 border-purple-200',
        'neura-crm': 'bg-green-100 text-green-800 border-green-200',
        'neura-forms': 'bg-orange-100 text-orange-800 border-orange-200',
        'neura-edu': 'bg-pink-100 text-pink-800 border-pink-200'
      };
      return colors[moduleId] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

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
                className={`w-full flex items-center justify-center gap-2 rtl:flex-row-reverse`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${getRTLAwareIconPosition('before')}`} />
                    <span>{t('reports.generatingReport')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                    <span>{t('reports.generateAIReport')}</span>
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
            
            {exampleQueries.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className={`${getRTLAwareTextAlign('center')} text-muted-foreground mb-2`}>
                  No example queries available
                </p>
                <p className={`${getRTLAwareTextAlign('center')} text-sm text-muted-foreground`}>
                  Activate modules to see relevant example queries for your data sources.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="ltr">
                {exampleQueries.map((example) => (
                  <Button
                    key={example.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className={`h-auto p-4 whitespace-normal text-start leading-relaxed ${getRTLAwareTextAlign('start')} relative`}
                    disabled={isLoading}
                    dir="auto"
                  >
                    <div className="w-full space-y-2">
                      <span className={`block w-full ${getRTLAwareTextAlign('start')} text-sm font-medium`}>
                        {example.text}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-start">
                        {example.modules.map(moduleId => (
                          <Badge 
                            key={moduleId}
                            variant="outline"
                            className={`text-xs ${getModuleBadgeColor(moduleId)}`}
                          >
                            {ModuleExampleQueryGenerator.getModuleDisplayName(moduleId)}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                          {example.category}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

NaturalLanguageInput.displayName = 'NaturalLanguageInput';
