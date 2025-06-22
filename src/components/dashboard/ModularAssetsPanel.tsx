
import React from 'react';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { MyReusableWorkflows } from './MyReusableWorkflows';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Repeat, 
  Users, 
  FileText, 
  BookOpen,
  Mail,
  Target,
  Play
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModularAssetsPanelProps {
  onStartWorkflow?: (workflowId: string, startData: any) => Promise<void>;
}

export function ModularAssetsPanel({ onStartWorkflow }: ModularAssetsPanelProps) {
  const { canAccessModule } = useModulePermissions();
  const { t } = useTranslation();

  // Get module assets function
  const getModuleAssets = () => {
    const assets = [];

    if (canAccessModule('neura-crm')) {
      assets.push(
        {
          id: 'crm-email-template',
          title: 'Welcome Email Template',
          description: 'Standard welcome email for new customers',
          module: 'NeuraCRM',
          icon: Mail,
          type: 'Email Template'
        },
        {
          id: 'crm-pipeline',
          title: 'Sales Pipeline Template',
          description: 'Standard 5-stage sales process',
          module: 'NeuraCRM',
          icon: Target,
          type: 'Pipeline'
        }
      );
    }

    if (canAccessModule('neura-forms')) {
      assets.push(
        {
          id: 'forms-contact',
          title: 'Contact Form Template',
          description: 'Standard contact form with validation',
          module: 'NeuraForms',
          icon: FileText,
          type: 'Form Template'
        },
        {
          id: 'forms-survey',
          title: 'Customer Survey Template',
          description: 'Customer satisfaction survey',
          module: 'NeuraForms',
          icon: FileText,
          type: 'Survey Template'
        }
      );
    }

    if (canAccessModule('neura-edu')) {
      assets.push(
        {
          id: 'edu-course',
          title: 'Course Template',
          description: 'Standard course structure with modules',
          module: 'NeuraEdu',
          icon: BookOpen,
          type: 'Course Template'
        }
      );
    }

    return assets;
  };

  const moduleAssets = getModuleAssets();

  // Now that all hooks are called, we can do conditional rendering
  // If user has NeuraFlow access, show workflow assets
  if (canAccessModule('neura-flow')) {
    return <MyReusableWorkflows onStartWorkflow={onStartWorkflow} />;
  }

  // For other modules, show module-specific assets
  if (moduleAssets.length === 0) {
    return (
      <div className="text-center py-8">
        <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No reusable assets available</p>
        <p className="text-sm text-muted-foreground">Create templates and assets in your active modules</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moduleAssets.map((asset) => {
        const Icon = asset.icon;
        return (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{asset.title}</h4>
                      <Badge variant="secondary" className="text-xs">{asset.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{asset.description}</p>
                    <Badge variant="outline" className="text-xs">{asset.module}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="ml-4">
                  <Play className="h-3 w-3 mr-1" />
                  Use
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
