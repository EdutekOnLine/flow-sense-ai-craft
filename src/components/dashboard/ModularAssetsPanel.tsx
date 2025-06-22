
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repeat, Users, FileText, BookOpen, Sparkles, Calendar, User, Rocket } from 'lucide-react';

interface ModularAssetsPanelProps {
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function ModularAssetsPanel({ onStartWorkflow }: ModularAssetsPanelProps) {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  const getAssetsPanelTitle = () => {
    if (hasMultipleModules) {
      return 'My Templates & Assets';
    }
    if (canAccessModule('neura-flow')) return 'My Reusable Workflows';
    if (canAccessModule('neura-crm')) return 'My CRM Templates';
    if (canAccessModule('neura-forms')) return 'My Form Templates';
    if (canAccessModule('neura-edu')) return 'My Course Templates';
    return 'My Templates';
  };

  const getAssetsPanelDescription = () => {
    if (hasMultipleModules) {
      return 'Reusable templates and assets from all your modules';
    }
    if (canAccessModule('neura-flow')) return 'Workflows you can use multiple times';
    if (canAccessModule('neura-crm')) return 'Email templates, sales sequences, and pipeline templates';
    if (canAccessModule('neura-forms')) return 'Reusable form templates and survey designs';
    if (canAccessModule('neura-edu')) return 'Course templates, lesson plans, and assignment templates';
    return 'Your reusable templates and assets';
  };

  const getAssetsIcon = () => {
    if (hasMultipleModules) return Sparkles;
    if (canAccessModule('neura-flow')) return Repeat;
    if (canAccessModule('neura-crm')) return Users;
    if (canAccessModule('neura-forms')) return FileText;
    if (canAccessModule('neura-edu')) return BookOpen;
    return Repeat;
  };

  const getPlaceholderAssets = () => {
    if (hasMultipleModules) {
      return [
        { id: 1, name: 'Welcome Email Sequence', type: 'CRM Template', description: 'Automated welcome email series for new customers', steps: 5 },
        { id: 2, name: 'Course Feedback Survey', type: 'Form Template', description: 'Standard course evaluation form', steps: 8 },
        { id: 3, name: 'Lesson Plan Template', type: 'Education Template', description: 'Structured template for creating lesson plans', steps: 12 }
      ];
    }
    
    if (canAccessModule('neura-crm')) {
      return [
        { id: 1, name: 'Sales Follow-up Sequence', type: 'Email Template', description: 'Automated follow-up emails for prospects', steps: 4 },
        { id: 2, name: 'Customer Onboarding', type: 'Process Template', description: 'Complete customer onboarding workflow', steps: 8 },
        { id: 3, name: 'Lead Qualification Template', type: 'CRM Template', description: 'Standard lead scoring and qualification process', steps: 6 }
      ];
    }
    
    if (canAccessModule('neura-forms')) {
      return [
        { id: 1, name: 'Customer Feedback Form', type: 'Survey Template', description: 'Comprehensive customer satisfaction survey', steps: 10 },
        { id: 2, name: 'Event Registration Form', type: 'Registration Template', description: 'Multi-step event registration with payment', steps: 6 }
      ];
    }
    
    if (canAccessModule('neura-edu')) {
      return [
        { id: 1, name: 'Assignment Grading Rubric', type: 'Assessment Template', description: 'Standardized grading criteria template', steps: 8 },
        { id: 2, name: 'Course Syllabus Template', type: 'Course Template', description: 'Complete course structure template', steps: 15 },
        { id: 3, name: 'Student Progress Report', type: 'Report Template', description: 'Automated student progress tracking', steps: 10 }
      ];
    }
    
    return [];
  };

  const AssetsIcon = getAssetsIcon();
  const placeholderAssets = getPlaceholderAssets();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl shadow-card">
          <AssetsIcon className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">{getAssetsPanelTitle()}</h2>
            {hasMultipleModules && (
              <Badge className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground">
                Multi-Module
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{getAssetsPanelDescription()}</p>
        </div>
      </div>
      <div className="bg-gradient-theme-secondary p-6 rounded-xl border border-border">
        {accessibleModules.length > 0 ? (
          <div className="space-y-4">
            {placeholderAssets.length > 0 ? (
              placeholderAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-card-foreground">{asset.name}</h4>
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20">
                          <Repeat className="h-3 w-3 me-1" />
                          Reusable
                        </Badge>
                      </div>
                      {asset.description && (
                        <p className="text-xs text-muted-foreground mb-2">{asset.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated 2 days ago
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Type: {asset.type}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {asset.steps} steps
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ms-4">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Rocket className="h-3 w-3 me-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AssetsIcon className="h-12 w-12 text-secondary mx-auto mb-4" />
                <p className="text-secondary mb-2">No templates available yet</p>
                <p className="text-sm text-muted-foreground">Create reusable templates to see them here</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <AssetsIcon className="h-12 w-12 text-secondary/40 mx-auto mb-4" />
            <p className="text-secondary mb-2">No templates available for your active modules</p>
            <p className="text-sm text-muted-foreground">Templates will appear here based on your module permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
