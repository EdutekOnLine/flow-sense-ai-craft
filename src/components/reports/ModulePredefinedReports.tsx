import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity, 
  Calendar,
  Workflow,
  Building2,
  GraduationCap,
  Settings,
  AlertCircle
} from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

interface PredefinedReport {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredModules: string[];
  dataSource: string;
  icon: React.ComponentType<any>;
  isPopular?: boolean;
}

const MODULE_REPORTS: PredefinedReport[] = [
  // NeuraFlow Reports
  {
    id: 'workflow-performance-dashboard',
    name: 'Workflow Performance Dashboard',
    description: 'Comprehensive overview of workflow completion rates, timing, and efficiency metrics',
    category: 'Workflow Management',
    requiredModules: ['neura-flow'],
    dataSource: 'workflow_performance',
    icon: Workflow,
    isPopular: true
  },
  {
    id: 'task-completion-trends',
    name: 'Task Completion Trends',
    description: 'Historical analysis of task completion patterns and bottlenecks',
    category: 'Workflow Management',
    requiredModules: ['neura-flow'],
    dataSource: 'workflow_trends',
    icon: TrendingUp
  },
  {
    id: 'workflow-step-analysis',
    name: 'Workflow Step Analysis',
    description: 'Detailed breakdown of individual workflow steps and their performance',
    category: 'Workflow Management',
    requiredModules: ['neura-flow'],
    dataSource: 'workflow_steps',
    icon: Activity
  },
  // NeuraCRM Reports
  {
    id: 'department-performance',
    name: 'Department Performance Analytics',
    description: 'Compare performance metrics across different departments and teams',
    category: 'Customer Management',
    requiredModules: ['neura-crm'],
    dataSource: 'department_analytics',
    icon: Building2,
    isPopular: true
  },
  {
    id: 'user-engagement-analysis',
    name: 'User Engagement Analysis',
    description: 'Track user activity patterns and engagement levels across the platform',
    category: 'Customer Management',
    requiredModules: ['neura-crm'],
    dataSource: 'profiles',
    icon: Users
  },
  // NeuraForms Reports
  {
    id: 'form-submission-analytics',
    name: 'Form Submission Analytics',
    description: 'Analyze form submission rates, completion times, and user behavior',
    category: 'Forms & Data Collection',
    requiredModules: ['neura-forms'],
    dataSource: 'workflow_steps',
    icon: FileText
  },
  {
    id: 'response-rate-analysis',
    name: 'Response Rate Analysis',
    description: 'Track response rates and identify opportunities for improvement',
    category: 'Forms & Data Collection',
    requiredModules: ['neura-forms'],
    dataSource: 'notifications',
    icon: BarChart3
  },
  // NeuraEdu Reports
  {
    id: 'student-progress-dashboard',
    name: 'Student Progress Dashboard',
    description: 'Monitor individual and group learning progress and achievements',
    category: 'Education & Learning',
    requiredModules: ['neura-edu'],
    dataSource: 'user_performance_analytics',
    icon: GraduationCap,
    isPopular: true
  },
  {
    id: 'course-completion-analytics',
    name: 'Course Completion Analytics',
    description: 'Track course completion rates and identify learning patterns',
    category: 'Education & Learning',
    requiredModules: ['neura-edu'],
    dataSource: 'workflow_performance',
    icon: Calendar
  },
  // Core Reports (always available)
  {
    id: 'system-notifications-report',
    name: 'System Notifications Report',
    description: 'Overview of system notifications, alerts, and communication patterns',
    category: 'System Analytics',
    requiredModules: ['neura-core'],
    dataSource: 'notifications',
    icon: Settings
  }
];

export function ModulePredefinedReports() {
  const { t } = useTranslation();
  const { activeModules, canManageModules, getModuleDisplayName } = useModulePermissions();
  
  const isRootUser = canManageModules();
  
  // Filter reports based on active modules
  const availableReports = MODULE_REPORTS.filter(report =>
    isRootUser || report.requiredModules.some(moduleId => activeModules.includes(moduleId))
  );
  
  const unavailableReports = MODULE_REPORTS.filter(report =>
    !isRootUser && !report.requiredModules.some(moduleId => activeModules.includes(moduleId))
  );

  // Group available reports by category
  const groupedReports = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, PredefinedReport[]>);

  const generateReport = (reportId: string) => {
    console.log('Generating predefined report:', reportId);
    // This would trigger the predefined report generation
  };

  const getModuleBadgeColor = (moduleId: string) => {
    const colors: Record<string, string> = {
      'neura-core': 'bg-blue-100 text-blue-800 border-blue-200',
      'neura-flow': 'bg-purple-100 text-purple-800 border-purple-200',
      'neura-crm': 'bg-green-100 text-green-800 border-green-200',
      'neura-forms': 'bg-orange-100 text-orange-800 border-orange-200',
      'neura-edu': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[moduleId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Available Reports */}
      {Object.keys(groupedReports).length > 0 ? (
        Object.entries(groupedReports).map(([category, reports]) => (
          <div key={category} className="space-y-4">
            <h3 className={`text-lg font-semibold text-foreground ${getRTLAwareTextAlign('start')}`}>
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow relative flex flex-col h-full">
                    {report.isPopular && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900">
                        Popular
                      </Badge>
                    )}
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
                        <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse flex-1`}>
                          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <CardTitle className={`text-lg ${getRTLAwareTextAlign('start')}`}>{report.name}</CardTitle>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.requiredModules.map(moduleId => (
                          <Badge 
                            key={moduleId}
                            variant="outline" 
                            className={`text-xs ${getModuleBadgeColor(moduleId)}`}
                          >
                            {getModuleDisplayName(moduleId)}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 space-y-4">
                      <div className="flex-1">
                        <p className={`text-sm text-muted-foreground ${getRTLAwareTextAlign('start')}`}>
                          {report.description}
                        </p>
                      </div>
                      <div className={`flex justify-end rtl:justify-start flex-shrink-0 pt-2`}>
                        <Button 
                          size="sm"
                          onClick={() => generateReport(report.id)}
                        >
                          {t('reports.generate')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Reports Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Activate modules to access predefined reports for your workspace.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unavailable Reports Section */}
      {!isRootUser && unavailableReports.length > 0 && (
        <div className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <p className="font-medium">Additional Reports Available</p>
                <p className="text-sm">
                  Activate additional modules to access {unavailableReports.length} more predefined reports.
                </p>
              </div>
            </AlertDescription>
          </Alert>
          
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              View unavailable reports ({unavailableReports.length})
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 opacity-60">
              {unavailableReports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="relative flex flex-col h-full">
                    <div className="absolute inset-0 bg-muted/50 rounded-lg z-10 flex items-center justify-center">
                      <Badge variant="secondary">Module Required</Badge>
                    </div>
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
                        <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse flex-1`}>
                          <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <CardTitle className={`text-lg text-muted-foreground ${getRTLAwareTextAlign('start')}`}>
                            {report.name}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {report.requiredModules.map(moduleId => (
                          <Badge 
                            key={moduleId}
                            variant="outline" 
                            className="text-xs bg-muted text-muted-foreground"
                          >
                            {getModuleDisplayName(moduleId)}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex-1">
                        <p className={`text-sm text-muted-foreground ${getRTLAwareTextAlign('start')}`}>
                          {report.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
