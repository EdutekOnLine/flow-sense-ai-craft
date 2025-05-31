
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowGenerationResult {
  nodes: any[];
  edges: any[];
  title: string;
  description: string;
}

interface NaturalLanguageGeneratorProps {
  onWorkflowGenerated: (result: WorkflowGenerationResult) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function NaturalLanguageGenerator({ onWorkflowGenerated, isOpen, onClose }: NaturalLanguageGeneratorProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<WorkflowGenerationResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the workflow you want to create.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    console.log('Generating workflow from description:', description);

    try {
      const { data, error } = await supabase.functions.invoke('generate-workflow', {
        body: { description: description.trim() }
      });

      if (error) {
        console.error('Error generating workflow:', error);
        throw error;
      }

      console.log('Generated workflow:', data);
      setLastGenerated(data);
      
      toast({
        title: "Workflow Generated",
        description: "Your workflow has been generated successfully. Review and apply it to the canvas.",
      });
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate workflow. Please try again or rephrase your description.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyWorkflow = () => {
    if (lastGenerated) {
      onWorkflowGenerated(lastGenerated);
      setDescription('');
      setLastGenerated(null);
      onClose();
      
      toast({
        title: "Workflow Applied",
        description: "The generated workflow has been added to your canvas.",
      });
    }
  };

  const handleClear = () => {
    setDescription('');
    setLastGenerated(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Workflow Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe your workflow in natural language:
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., When someone fills out the HR form, notify the HR manager and wait for approval. If approved, send welcome email to new employee and create their account. If rejected, notify the applicant."
              className="min-h-[120px]"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-2">
              Try to be specific about triggers, conditions, approvals, and outcomes.
            </p>
          </div>

          {lastGenerated && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">{lastGenerated.title}</h4>
                    <p className="text-sm text-green-700">{lastGenerated.description}</p>
                  </div>
                </div>
                <div className="text-sm text-green-700">
                  <strong>Generated:</strong> {lastGenerated.nodes.length} steps, {lastGenerated.edges.length} connections
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            {lastGenerated && (
              <>
                <Button variant="outline" onClick={handleClear} disabled={isGenerating}>
                  Clear
                </Button>
                <Button onClick={handleApplyWorkflow} disabled={isGenerating}>
                  Apply to Canvas
                </Button>
              </>
            )}
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !description.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
