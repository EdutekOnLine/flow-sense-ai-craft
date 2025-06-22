
import React from 'react';
import { ModuleMetricsCards } from './ModuleMetricsCards';
import { ModuleQuickActions } from './ModuleQuickActions';
import { ModuleIntegrationOverview } from './ModuleIntegrationOverview';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity,
  Sparkles
} from 'lucide-react';

interface DashboardContentProps {
  onOpenWorkflow?: (workflowId: string) => void;
}

export default function DashboardContent({ onOpenWorkflow }: DashboardContentProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { canAccessModule, getAccessibleModules } = useModulePermissions();

  const accessibleModules = getAccessibleModules();
  const hasWorkflowAccess = canAccessModule('neura-flow');
  const hasMultipleModules = accessibleModules.length > 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-theme-primary rounded-2xl p-8 text-foreground border border-border">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
                <Activity className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-foreground">{t('dashboard.title')}</h1>
                  <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground animate-pulse">
                    LIVE
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg">
                  {hasMultipleModules 
                    ? 'Multi-module business overview and management hub'
                    : t('dashboard.subtitle')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-secondary/10 rounded-full blur-lg"></div>
      </div>

      {/* Dynamic Module Metrics */}
      <ModuleMetricsCards />

      {/* Main content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Quick Actions */}
          <ModuleQuickActions />

          {/* Module Integration Overview */}
          <ModuleIntegrationOverview />

          {/* Welcome message */}
          <div className="space-y-6">
            <Card className="border-2 border-primary/20 bg-gradient-theme-primary">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-to-br from-primary to-accent rounded-xl w-fit mb-4 shadow-card">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl text-foreground">Welcome to NeuraCore</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg">
                  {hasMultipleModules 
                    ? 'Access your business modules and manage your workspace from this central hub.'
                    : 'Your business management platform. Contact your administrator to activate additional modules and unlock more features.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
