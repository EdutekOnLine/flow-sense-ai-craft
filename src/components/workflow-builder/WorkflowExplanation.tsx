
import React from 'react';
import { X, FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface WorkflowExplanationProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  workflowName?: string;
}

export function WorkflowExplanation({
  isOpen,
  onClose,
  explanation,
  workflowName
}: WorkflowExplanationProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Workflow explanation has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">
              Workflow Explanation
              {workflowName && <span className="text-gray-500 ml-2">- {workflowName}</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <ScrollArea className="h-full">
            <div className="prose prose-sm max-w-none">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Plain Language Summary
                </h3>
                <p className="text-blue-700 leading-relaxed">
                  {explanation}
                </p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>What is this?</strong> This explanation converts your visual workflow 
                  into plain language to help you understand, debug, and share your automation.
                </p>
                <p>
                  <strong>Use cases:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Share workflow logic with non-technical team members</li>
                  <li>Document workflows for compliance or training</li>
                  <li>Debug complex workflows by understanding the flow</li>
                  <li>Review workflow logic before deployment</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
