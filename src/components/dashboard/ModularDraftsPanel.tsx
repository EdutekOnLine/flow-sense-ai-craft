
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Workflow, Users, FileText, BookOpen, Edit, Calendar, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ModularDraftsPanelProps {
  onOpenWorkflow?: (workflowId: string) => void;
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function ModularDraftsPanel({ onOpenWorkflow, onStartWorkflow }: ModularDraftsPanelProps) {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  const { canEditWorkflows } = useWorkflowPermissions();
  const { profile } = useAuth();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  const getDraftsPanelTitle = () => {
    if (hasMultipleModules) {
      return 'My Drafts & Projects';
    }
    if (canAccessModule('neura-flow')) {
      return profile?.role === 'admin' ? 'All Saved Workflows' : 'My Saved Workflows';
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
      return profile?.role === 'admin' ? 'Manage all workflow templates in the system and start new workflow instances' : 'Workflows you have saved';
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

  const getPlaceholderDrafts = () => {
    if (hasMultipleModules) {
      return [
        { id: 1, name: 'Customer Onboarding Campaign', type: 'CRM Draft', description: 'Email sequence for new customers', nodes: 8, isReusable: true },
        { id: 2, name: 'Product Survey Draft', type: 'Form Draft', description: 'Feedback collection form', nodes: 12, isReusable: false },
        { id: 3, name: 'Advanced Math Course', type: 'Education Draft', description: 'Course structure and materials', nodes: 25, isReusable: true }
      ];
    }
    
    if (canAccessModule('neura-crm')) {
      return [
        { id: 1, name: 'Lead Nurturing Sequence', type: 'Email Campaign', description: 'Automated lead nurturing emails', nodes: 6, isReusable: true },
        { id: 2, name: 'Sales Proposal Template', type: 'Document Draft', description: 'Standard sales proposal format', nodes: 4, isReusable: true },
        { id: 3, name: 'Customer Follow-up Process', type: 'Workflow Draft', description: 'Post-sale customer follow-up', nodes: 10, isReusable: false }
      ];
    }
    
    if (canAccessModule('neura-forms')) {
      return [
        { id: 1, name: 'Employee Feedback Form', type: 'Survey Draft', description: 'Annual employee satisfaction survey', nodes: 15, isReusable: true },
        { id: 2, name: 'Event Registration', type: 'Form Draft', description: 'Multi-step event registration form', nodes: 8, isReusable: false }
      ];
    }
    
    if (canAccessModule('neura-edu')) {
      return [
        { id: 1, name: 'JavaScript Fundamentals', type: 'Course Draft', description: 'Beginner JavaScript programming course', nodes: 20, isReusable: true },
        { id: 2, name: 'Final Exam Template', type: 'Assessment Draft', description: 'Comprehensive final examination', nodes: 12, isReusable: true },
        { id: 3, name: 'Study Group Guidelines', type: 'Resource Draft', description: 'Guidelines for student study groups', nodes: 6, isReusable: false }
      ];
    }
    
    return [];
  };

  const DraftsIcon = getDraftsIcon();
  const placeholderDrafts = getPlaceholderDrafts();

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
        {accessibleModules.length > 0 ? (
          <div className="space-y-4">
            {placeholderDrafts.length > 0 ? (
              <>
                {placeholderDrafts.slice(0, 5).map((draft) => (
                  <div
                    key={draft.id}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-foreground">{draft.name}</h4>
                          <Badge 
                            variant={draft.isReusable ? "default" : "secondary"}
                            className={draft.isReusable ? "bg-green-100 text-green-800 border-green-300" : "bg-orange-100 text-orange-800 border-orange-300"}
                          >
                            {draft.isReusable ? (
                              <>
                                <Edit className="h-3 w-3 mr-1" />
                                Reusable
                              </>
                            ) : (
                              'One-Time'
                            )}
                          </Badge>
                        </div>
                        {draft.description && (
                          <p className="text-xs text-muted-foreground mb-2">{draft.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated 1 day ago
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Type: {draft.type}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {draft.nodes} components
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {placeholderDrafts.length > 5 && (
                  <div className="text-center pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {placeholderDrafts.length - 5} more drafts available
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <DraftsIcon className="h-12 w-12 text-accent/40 mx-auto mb-4" />
                <p className="text-accent mb-2">No drafts found</p>
                <p className="text-sm text-muted-foreground">Start creating content to see your drafts here</p>
              </div>
            )}
          </div>
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
