
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NodeAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generatedContent: any) => void;
  nodeType: string;
  fieldType: 'email' | 'webhook' | 'condition' | 'delay' | 'general';
  currentValues?: any;
}

const FIELD_TEMPLATES = {
  email: {
    subject: [
      'Welcome to {{company_name}}!',
      'Your order #{{order_number}} has been confirmed',
      'Action required: Please review your account',
      'Thank you for your submission',
      'Your request has been processed'
    ],
    body: [
      'Hi {{first_name}},\n\nThank you for joining us! We\'re excited to have you on board.\n\nBest regards,\nThe Team',
      'Dear {{first_name}},\n\nYour order #{{order_number}} has been successfully placed and is being processed.\n\nTracking details will be sent shortly.\n\nThank you for your business!',
      'Hello {{first_name}},\n\nWe noticed some activity on your account that requires your attention.\n\nPlease log in to review and take necessary action.\n\nBest regards,\nSecurity Team'
    ]
  },
  webhook: {
    payloads: [
      '{\n  "event": "user_created",\n  "data": {\n    "user_id": "{{user_id}}",\n    "email": "{{email}}",\n    "timestamp": "{{timestamp}}"\n  }\n}',
      '{\n  "notification": {\n    "title": "{{title}}",\n    "message": "{{message}}",\n    "user_id": "{{user_id}}"\n  }\n}',
      '{\n  "action": "send_email",\n  "parameters": {\n    "to": "{{recipient_email}}",\n    "template": "{{template_name}}",\n    "data": {{workflow_data}}\n  }\n}'
    ]
  },
  condition: {
    examples: [
      'Check if user is premium member',
      'Validate order amount is greater than $100',
      'Ensure form field is not empty',
      'Verify user email is confirmed',
      'Check if deadline has passed'
    ]
  },
  delay: {
    suggestions: [
      { duration: 5, unit: 'minutes', description: 'Short processing delay' },
      { duration: 1, unit: 'hours', description: 'Standard review time' },
      { duration: 24, unit: 'hours', description: 'Daily digest interval' },
      { duration: 3, unit: 'days', description: 'Follow-up reminder' },
      { duration: 7, unit: 'days', description: 'Weekly check-in' }
    ]
  }
};

export function NodeAIAssistant({ 
  isOpen, 
  onClose, 
  onApply, 
  nodeType, 
  fieldType, 
  currentValues 
}: NodeAIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please provide a description",
        description: "Tell us what you'd like the AI to help you with.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist-node', {
        body: {
          prompt,
          fieldType,
          nodeType,
          currentValues
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTemplate = (template: string) => {
    setSelectedTemplate(template);
    if (fieldType === 'email') {
      if (template.includes('{{')) {
        setGeneratedContent({
          subject: template.includes('@') ? '' : template,
          body: template.includes('@') ? template : ''
        });
      }
    } else if (fieldType === 'webhook') {
      setGeneratedContent({ payload: template });
    } else if (fieldType === 'delay') {
      const suggestion = FIELD_TEMPLATES.delay.suggestions.find(s => 
        template.includes(s.description)
      );
      if (suggestion) {
        setGeneratedContent({
          duration: suggestion.duration,
          unit: suggestion.unit
        });
      }
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Generated content has been copied."
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleApplyContent = () => {
    if (generatedContent) {
      onApply(generatedContent);
      onClose();
      toast({
        title: "Content applied",
        description: "AI-generated content has been applied to your node."
      });
    }
  };

  const getTemplates = () => {
    switch (fieldType) {
      case 'email':
        return [...FIELD_TEMPLATES.email.subject, ...FIELD_TEMPLATES.email.body];
      case 'webhook':
        return FIELD_TEMPLATES.webhook.payloads;
      case 'condition':
        return FIELD_TEMPLATES.condition.examples;
      case 'delay':
        return FIELD_TEMPLATES.delay.suggestions.map(s => 
          `${s.duration} ${s.unit} - ${s.description}`
        );
      default:
        return [];
    }
  };

  const getFieldDescription = () => {
    switch (fieldType) {
      case 'email':
        return 'Generate email subject lines and body content with personalization tokens';
      case 'webhook':
        return 'Create webhook payloads and API request structures';
      case 'condition':
        return 'Set up conditional logic and validation rules';
      case 'delay':
        return 'Configure appropriate timing and delay settings';
      default:
        return 'Get AI assistance for configuring this field';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Assistant - {fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field
          </DialogTitle>
          <DialogDescription>
            {getFieldDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Templates</Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {getTemplates().map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 whitespace-normal"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="text-xs">{template}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Generation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Custom Generation</Label>
            <Textarea
              placeholder={`Describe what you want for this ${fieldType} field...
Example: "Create a professional welcome email for new customers with order confirmation details"`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleGenerateContent}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Generated Content</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {fieldType === 'email' && (
                  <>
                    {generatedContent.subject && (
                      <div>
                        <Label className="text-xs text-gray-600">Subject</Label>
                        <div className="font-medium">{generatedContent.subject}</div>
                      </div>
                    )}
                    {generatedContent.body && (
                      <div>
                        <Label className="text-xs text-gray-600">Body</Label>
                        <div className="whitespace-pre-wrap text-sm">{generatedContent.body}</div>
                      </div>
                    )}
                  </>
                )}
                
                {fieldType === 'webhook' && (
                  <div>
                    <Label className="text-xs text-gray-600">Payload</Label>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                      {typeof generatedContent.payload === 'string' 
                        ? generatedContent.payload 
                        : JSON.stringify(generatedContent.payload, null, 2)}
                    </pre>
                  </div>
                )}
                
                {fieldType === 'condition' && (
                  <div>
                    <Label className="text-xs text-gray-600">Condition Logic</Label>
                    <div className="space-y-2">
                      {generatedContent.field && (
                        <div><strong>Field:</strong> {generatedContent.field}</div>
                      )}
                      {generatedContent.operator && (
                        <div><strong>Operator:</strong> {generatedContent.operator}</div>
                      )}
                      {generatedContent.value && (
                        <div><strong>Value:</strong> {generatedContent.value}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {fieldType === 'delay' && (
                  <div>
                    <Label className="text-xs text-gray-600">Delay Configuration</Label>
                    <div>
                      <strong>{generatedContent.duration} {generatedContent.unit}</strong>
                      {generatedContent.reasoning && (
                        <div className="text-sm text-gray-600 mt-1">{generatedContent.reasoning}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleApplyContent} className="flex-1">
                  Apply to Node
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
