
import { useState } from 'react';

export function useWorkflowDialogs() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [contextualSuggestionsPosition, setContextualSuggestionsPosition] = useState<{ x: number; y: number } | null>(null);

  return {
    isGeneratorOpen,
    setIsGeneratorOpen,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    showReview,
    setShowReview,
    aiAssistantEnabled,
    setAiAssistantEnabled,
    showAssistant,
    setShowAssistant,
    contextualSuggestionsPosition,
    setContextualSuggestionsPosition,
  };
}
