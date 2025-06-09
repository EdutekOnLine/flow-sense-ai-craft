
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Clock, AlertTriangle } from 'lucide-react';
import { useUserActivityReport } from '@/hooks/useReports';
import type { ReportFilters } from './ReportsContent';

interface UserActivityReportProps {
  filters: ReportFilters;
}

export default function UserActivityReport({ filters }: UserActivityReportProps) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useUserActivityReport(filters);

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

  const chartData = data.map(user => ({
    name: `${user.first_name} ${user.last_name}`,
    completed: user.completed_assignments,
    pending: user.pending_assignments,
    inProgress: user.in_progress_assignments,
    total: user.total_assignments,
  }));

  const totalUsers = data.length;
  const totalAssignments = data.reduce((sum, user) => sum + user.total_assignments, 0);
  const totalCompleted = data.reduce((sum, user) => sum + user.completed_assignments, 0);
  const totalOverdue = data.reduce((sum, user) => sum + user.overdue_assignments, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.completedTasks')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.overdueTasks')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalOverdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.userActivity')}</CardTitle>
          <CardDescription>{t('reports.userActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#00C49F" name={t('status.completed')} />
              <Bar dataKey="inProgress" fill="#0088FE" name={t('status.inProgress')} />
              <Bar dataKey="pending" fill="#FFBB28" name={t('status.pending')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.userDetails')}</CardTitle>
          <CardDescription>{t('reports.userDetailsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.user')}</TableHead>
                <TableHead>{t('reports.department')}</TableHead>
                <TableHead className="text-right">{t('reports.totalAssignments')}</TableHead>
                <TableHead className="text-right">{t('status.completed')}</TableHead>
                <TableHead className="text-right">{t('status.pending')}</TableHead>
                <TableHead className="text-right">{t('status.inProgress')}</TableHead>
                <TableHead className="text-right">{t('reports.overdue')}</TableHead>
                <TableHead className="text-right">{t('reports.avgTime')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>
                    {user.department && (
                      <Badge variant="secondary">{user.department}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.total_assignments}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {user.completed_assignments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {user.pending_assignments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {user.in_progress_assignments}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.overdue_assignments > 0 && (
                      <Badge variant="destructive">
                        {user.overdue_assignments}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.avg_completion_hours 
                      ? `${Math.round(user.avg_completion_hours)}h`
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
