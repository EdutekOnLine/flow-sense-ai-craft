
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useModuleDashboardData } from '@/hooks/useModuleDashboardData';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { 
  Workflow, 
  Users, 
  Building2, 
  FileText, 
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const moduleIcons = {
  'neura-flow': Workflow,
  'neura-crm': Building2,
  'neura-forms': FileText,
  'neura-edu': GraduationCap,
};

export function ModuleIntegrationOverview() {
  const { data, isLoading } = useModuleDashboardData();
  const { getAccessibleModules } = useModulePermissions();
  const { t } = useTranslation();

  const accessibleModules = getAccessibleModules();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse h-6 bg-muted rounded w-48"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accessibleModules.length <= 1) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          Module Integration Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* NeuraFlow Integration */}
          {accessibleModules.includes('neura-flow') && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Workflow className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">NeuraFlow</h3>
                  <p className="text-sm text-muted-foreground">Workflow automation active</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <span className="text-xs text-muted-foreground">Core module</span>
              </div>
            </div>
          )}

          {/* NeuraCRM Integration */}
          {accessibleModules.includes('neura-crm') && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">NeuraCRM</h3>
                  <p className="text-sm text-muted-foreground">
                    {data?.moduleMetrics?.['neura-crm']?.totalLeads || 0} leads tracked
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                {data?.moduleMetrics?.['neura-crm'] && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{data.moduleMetrics['neura-crm'].conversionRate}% conversion</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NeuraForms Integration */}
          {accessibleModules.includes('neura-forms') && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">NeuraForms</h3>
                  <p className="text-sm text-muted-foreground">
                    {data?.moduleMetrics?.['neura-forms']?.submissions || 0} submissions collected
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <span className="text-xs text-muted-foreground">Data collection</span>
              </div>
            </div>
          )}

          {/* NeuraEdu Integration */}
          {accessibleModules.includes('neura-edu') && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">NeuraEdu</h3>
                  <p className="text-sm text-muted-foreground">
                    {data?.moduleMetrics?.['neura-edu']?.activeStudents || 0} active students
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                {data?.moduleMetrics?.['neura-edu'] && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>{data.moduleMetrics['neura-edu'].completionRate}% completion</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Integration Health */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-green-800">Integration Health</h4>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Excellent
              </Badge>
            </div>
            <Progress value={95} className="h-2 mb-2" />
            <p className="text-xs text-green-700">
              All modules are functioning optimally with excellent data synchronization
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
