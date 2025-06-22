
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { SavedWorkflows } from './SavedWorkflows';
import { Badge } from '@/components/ui/badge';
import { Workflow, Users, FileText, BookOpen, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';

interface ModularDraftsPanelProps {
  onOpenWorkflow?: (workflowId: string) => void;
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function ModularDraftsPanel({ onOpenWorkflow, onStartWorkflow }: ModularDraftsPanelProps) {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  const { canEditWorkflows } = useWorkflowPermissions();
  const { profile } = useAuth();
  const { t } = useTranslation();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  // Don't show if user can't edit workflows and only has workflow access
  if (!canEditWorkflows && accessibleModules.length === 1 && canAccessModule('neura-flow')) {
    return null;
  }

  const getDraftsPanelTitle = () => {
    if (hasMultipleModules) {
      return 'My Drafts & Projects';
    }
    if (canAccessModule('neura-flow')) {
      return profile?.role === 'admin' ? t('dashboard.allSavedWorkflows') : t('dashboard.mySavedWorkflows');
    }
    if (canAccessModule('neura-crm')) return 'My CRM Drafts';
    if (canAccessModule('neura-forms')) return 'My Form Drafts';
    if (canAccessModule('neura-edu')) return 'My Course Drafts';
    return 'My Drafts';
  };

  const getDraftsPanelDescription = () => {
    if (hasMultipleModules) {
      return 'Draft content and works in progress from all your modules';
    }
    if (canAccessModule('neura-flow')) {
      return profile?.role === 'admin' ? t('dashboard.allSavedWorkflowsDescription') : t('dashboard.mySavedWorkflowsDescription');
    }
    if (canAccessModule('neura-crm')) return 'Draft campaigns, incomplete deals, and proposal drafts';
    if (canAccessModule('neura-forms')) return 'Draft forms, incomplete surveys, and form designs';
    if (canAccessModule('neura-edu')) return 'Draft courses, lesson plans, and assignments in progress';
    return 'Your draft content and works in progress';
  };

  const getDraftsIcon = () => {
    if (hasMultipleModules) return Edit;
    if (canAccessModule('neura-flow')) return Workflow;
    if (canAccessModule('neura-crm')) return Users;
    if (canAccessModule('neura-forms')) return FileText;
    if (canAccessModule('neura-edu')) return BookOpen;
    return Workflow;
  };

  const DraftsIcon = getDraftsIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-accent to-accent/70 rounded-xl shadow-card">
          <DraftsIcon className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{getDraftsPanelTitle()}</h2>
            {hasMultipleModules && (
              <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
                Multi-Module
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{getDraftsPanelDescription()}</p>
        </div>
      </div>
      <div className="bg-gradient-theme-accent p-6 rounded-xl border border-border">
        {canAccessModule('neura-flow') && canEditWorkflows ? (
          <SavedWorkflows onOpenWorkflow={onOpenWorkflow} onStartWorkflow={onStartWorkflow} />
        ) : (
          <div className="text-center py-6">
            <DraftsIcon className="h-12 w-12 text-accent/40 mx-auto mb-4" />
            <p className="text-accent mb-2">No drafts available for your active modules</p>
            <p className="text-sm text-muted-foreground">Drafts and works in progress will appear here based on your module permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
