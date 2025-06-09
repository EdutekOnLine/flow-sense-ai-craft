
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Users, TrendingUp } from 'lucide-react';
import { useDepartmentAnalyticsReport } from '@/hooks/useReports';
import type { ReportFilters } from './ReportsContent';

interface DepartmentAnalyticsReportProps {
  filters: ReportFilters;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DepartmentAnalyticsReport({ filters }: DepartmentAnalyticsReportProps) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDepartmentAnalyticsReport(filters);

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

  const chartData = data.map(dept => ({
    name: dept.department,
    completed: dept.completed_assignments,
    pending: dept.pending_assignments,
    inProgress: dept.in_progress_assignments,
    total: dept.total_assignments,
    users: dept.user_count,
  }));

  const workloadData = data.map((dept, index) => ({
    name: dept.department,
    value: dept.total_assignments,
    color: COLORS[index % COLORS.length],
  }));

  const totalDepartments = data.length;
  const totalUsers = data.reduce((sum, dept) => sum + dept.user_count, 0);
  const totalAssignments = data.reduce((sum, dept) => sum + dept.total_assignments, 0);
  const avgCompletionTime = data.reduce((sum, dept) => sum + (dept.avg_completion_hours || 0), 0) / data.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalDepartments')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalAssignments')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.avgCompletionTime')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgCompletionTime ? `${Math.round(avgCompletionTime)}h` : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Workload Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.departmentWorkload')}</CardTitle>
            <CardDescription>{t('reports.departmentWorkloadDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#00C49F" name={t('status.completed')} />
                <Bar dataKey="inProgress" fill="#0088FE" name={t('status.inProgress')} />
                <Bar dataKey="pending" fill="#FFBB28" name={t('status.pending')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.workloadDistribution')}</CardTitle>
            <CardDescription>{t('reports.workloadDistributionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workloadData.map((entry, index) => (
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
          <CardTitle>{t('reports.departmentDetails')}</CardTitle>
          <CardDescription>{t('reports.departmentDetailsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.department')}</TableHead>
                <TableHead className="text-right">{t('reports.userCount')}</TableHead>
                <TableHead className="text-right">{t('reports.totalAssignments')}</TableHead>
                <TableHead className="text-right">{t('status.completed')}</TableHead>
                <TableHead className="text-right">{t('status.pending')}</TableHead>
                <TableHead className="text-right">{t('status.inProgress')}</TableHead>
                <TableHead className="text-right">{t('reports.avgTime')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((department) => (
                <TableRow key={department.department}>
                  <TableCell className="font-medium">
                    <Badge variant="secondary">{department.department}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {department.user_count}
                  </TableCell>
                  <TableCell className="text-right">
                    {department.total_assignments}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {department.completed_assignments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {department.pending_assignments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {department.in_progress_assignments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {department.avg_completion_hours 
                      ? `${Math.round(department.avg_completion_hours)}h`
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
