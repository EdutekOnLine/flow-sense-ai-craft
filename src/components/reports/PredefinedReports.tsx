
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, FileText, TrendingUp, Activity, Calendar } from 'lucide-react';

const predefinedReports = [
  {
    id: 'workflow_performance',
    name: 'Workflow Performance Report',
    description: 'Detailed analysis of workflow completion rates, bottlenecks, and efficiency metrics',
    icon: BarChart3,
    category: 'Operations',
    dataSource: 'workflow_performance_analytics'
  },
  {
    id: 'user_productivity',
    name: 'User Productivity Report',
    description: 'Individual and team productivity metrics including task completion rates',
    icon: Users,
    category: 'HR',
    dataSource: 'user_performance_analytics'
  },
  {
    id: 'task_management',
    name: 'Task Management Report',
    description: 'Overview of all tasks, assignments, and completion status across the organization',
    icon: FileText,
    category: 'Operations',
    dataSource: 'workflow_step_assignments'
  },
  {
    id: 'department_analytics',
    name: 'Department Analytics Report',
    description: 'Cross-departmental comparison of performance and resource utilization',
    icon: TrendingUp,
    category: 'Business Intelligence',
    dataSource: 'department_analytics'
  },
  {
    id: 'workflow_trends',
    name: 'Workflow Trends Report',
    description: 'Historical trends and patterns in workflow creation and completion',
    icon: Activity,
    category: 'Business Intelligence',
    dataSource: 'workflow_trends'
  },
  {
    id: 'sla_compliance',
    name: 'SLA Compliance Report',
    description: 'Due date performance and service level agreement compliance tracking',
    icon: Calendar,
    category: 'Operations',
    dataSource: 'workflow_step_assignments'
  }
];

export function PredefinedReports() {
  const { t } = useTranslation();

  const generateReport = (reportId: string) => {
    console.log('Generating predefined report:', reportId);
    // This would trigger the predefined report generation
  };

  const groupedReports = predefinedReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, typeof predefinedReports>);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('reports.predefinedReports')}</h2>
        <p className="text-gray-600">{t('reports.predefinedDescription')}</p>
      </div>

      {Object.entries(groupedReports).map(([category, reports]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {report.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Source: {report.dataSource}
                      </span>
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
      ))}
    </div>
  );
}
