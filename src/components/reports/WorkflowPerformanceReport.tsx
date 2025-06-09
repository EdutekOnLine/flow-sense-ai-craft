
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useWorkflowPerformanceReport } from '@/hooks/useReports';
import type { ReportFilters } from './ReportsContent';

interface WorkflowPerformanceReportProps {
  filters: ReportFilters;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function WorkflowPerformanceReport({ filters }: WorkflowPerformanceReportProps) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useWorkflowPerformanceReport(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.workflow_name,
    completed: item.completed_instances,
    active: item.active_instances,
    cancelled: item.cancelled_instances,
    total: item.total_instances,
  }));

  const completionRateData = data.map(item => ({
    name: item.workflow_name,
    rate: item.total_instances > 0 ? (item.completed_instances / item.total_instances) * 100 : 0,
  }));

  const totalInstances = data.reduce((sum, item) => sum + item.total_instances, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.completed_instances, 0);
  const totalActive = data.reduce((sum, item) => sum + item.active_instances, 0);
  const avgCompletionTime = data.reduce((sum, item) => sum + (item.avg_completion_hours || 0), 0) / data.length;

  const summaryData = [
    { name: t('status.completed'), value: totalCompleted, color: '#00C49F' },
    { name: t('status.active'), value: totalActive, color: '#0088FE' },
    { name: t('workflow.cancelled'), value: totalInstances - totalCompleted - totalActive, color: '#FF8042' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalWorkflows')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalInstances')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstances}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.completionRate')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInstances > 0 ? Math.round((totalCompleted / totalInstances) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.avgCompletionTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgCompletionTime ? `${Math.round(avgCompletionTime)}h` : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Instances by Workflow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.instancesByWorkflow')}</CardTitle>
            <CardDescription>{t('reports.instancesByWorkflowDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#00C49F" name={t('status.completed')} />
                <Bar dataKey="active" fill="#0088FE" name={t('status.active')} />
                <Bar dataKey="cancelled" fill="#FF8042" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.statusDistribution')}</CardTitle>
            <CardDescription>{t('reports.statusDistributionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.detailedBreakdown')}</CardTitle>
          <CardDescription>{t('reports.detailedBreakdownDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('workflow.workflowName')}</TableHead>
                <TableHead className="text-right">{t('reports.totalInstances')}</TableHead>
                <TableHead className="text-right">{t('status.completed')}</TableHead>
                <TableHead className="text-right">{t('status.active')}</TableHead>
                <TableHead className="text-right">{t('reports.completionRate')}</TableHead>
                <TableHead className="text-right">{t('reports.avgTime')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((workflow) => (
                <TableRow key={workflow.workflow_id}>
                  <TableCell className="font-medium">
                    {workflow.workflow_name}
                  </TableCell>
                  <TableCell className="text-right">
                    {workflow.total_instances}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {workflow.completed_instances}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {workflow.active_instances}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {workflow.total_instances > 0 
                      ? `${Math.round((workflow.completed_instances / workflow.total_instances) * 100)}%`
                      : '--'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {workflow.avg_completion_hours 
                      ? `${Math.round(workflow.avg_completion_hours)}h`
                      : '--'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
