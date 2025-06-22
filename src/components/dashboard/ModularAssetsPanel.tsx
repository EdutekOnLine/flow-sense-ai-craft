
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { MyReusableWorkflows } from './MyReusableWorkflows';
import { Badge } from '@/components/ui/badge';
import { Repeat, Users, FileText, BookOpen, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModularAssetsPanelProps {
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function ModularAssetsPanel({ onStartWorkflow }: ModularAssetsPanelProps) {
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  const { t } = useTranslation();
  
  const accessibleModules = getAccessibleModules();
  const hasMultipleModules = accessibleModules.length > 1;

  const getAssetsPanelTitle = () => {
    if (hasMultipleModules) {
      return 'My Templates & Assets';
    }
    if (canAccessModule('neura-flow')) return t('dashboard.myReusableWorkflows');
    if (canAccessModule('neura-crm')) return 'My CRM Templates';
    if (canAccessModule('neura-forms')) return 'My Form Templates';
    if (canAccessModule('neura-edu')) return 'My Course Templates';
    return 'My Templates';
  };

  const getAssetsPanelDescription = () => {
    if (hasMultipleModules) {
      return 'Reusable templates and assets from all your modules';
    }
    if (canAccessModule('neura-flow')) return t('dashboard.myReusableWorkflowsDescription');
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

  const AssetsIcon = getAssetsIcon();

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
        {canAccessModule('neura-flow') ? (
          <MyReusableWorkflows onStartWorkflow={onStartWorkflow} />
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
