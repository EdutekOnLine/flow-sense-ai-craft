
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Building2, Clock, TrendingUp } from 'lucide-react';
import WorkflowPerformanceReport from './WorkflowPerformanceReport';
import UserActivityReport from './UserActivityReport';
import DepartmentAnalyticsReport from './DepartmentAnalyticsReport';
import ReportFilters from './ReportFilters';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';

export interface ReportFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  department?: string;
  userId?: string;
  workflowId?: string;
}

export default function ReportsContent() {
  const { t } = useTranslation();
  const { canViewUsers } = useWorkflowPermissions();
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    },
  });

  const reportCards = [
    {
      id: 'workflow-performance',
      title: t('reports.workflowPerformance'),
      description: t('reports.workflowPerformanceDesc'),
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      id: 'user-activity',
      title: t('reports.userActivity'),
      description: t('reports.userActivityDesc'),
      icon: Users,
      color: 'text-green-600',
      requiresUserAccess: true,
    },
    {
      id: 'department-analytics',
      title: t('reports.departmentAnalytics'),
      description: t('reports.departmentAnalyticsDesc'),
      icon: Building2,
      color: 'text-purple-600',
      requiresUserAccess: true,
    },
  ];

  const availableReports = reportCards.filter(
    (report) => !report.requiresUserAccess || canViewUsers
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
        <p className="text-muted-foreground">{t('reports.subtitle')}</p>
      </div>

      <ReportFilters filters={filters} onFiltersChange={setFilters} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {report.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${report.color}`} />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  {report.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="workflow-performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow-performance">
            {t('reports.workflowPerformance')}
          </TabsTrigger>
          {canViewUsers && (
            <>
              <TabsTrigger value="user-activity">
                {t('reports.userActivity')}
              </TabsTrigger>
              <TabsTrigger value="department-analytics">
                {t('reports.departmentAnalytics')}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="workflow-performance" className="space-y-4">
          <WorkflowPerformanceReport filters={filters} />
        </TabsContent>

        {canViewUsers && (
          <>
            <TabsContent value="user-activity" className="space-y-4">
              <UserActivityReport filters={filters} />
            </TabsContent>
            <TabsContent value="department-analytics" className="space-y-4">
              <DepartmentAnalyticsReport filters={filters} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
