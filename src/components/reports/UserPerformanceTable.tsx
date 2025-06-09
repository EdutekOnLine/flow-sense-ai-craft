
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUserAnalytics } from '@/hooks/useAnalytics';
import { Progress } from '@/components/ui/progress';

export function UserPerformanceTable() {
  const { data: users, isLoading, error } = useUserAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading user performance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-red-500">Error loading user performance</div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">No user data available</div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'root':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Workflows Created</TableHead>
            <TableHead>Steps Assigned</TableHead>
            <TableHead>Completion Rate</TableHead>
            <TableHead>Time Variance</TableHead>
            <TableHead>Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.full_name || 'Unknown User'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getRoleColor(user.role)}>
                  {user.role?.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{user.department || 'N/A'}</TableCell>
              <TableCell>{user.workflows_created || 0}</TableCell>
              <TableCell>{user.steps_assigned || 0}</TableCell>
              <TableCell>
                <span className={getCompletionRateColor(user.completion_rate || 0)}>
                  {user.completion_rate ? `${user.completion_rate.toFixed(1)}%` : '0%'}
                </span>
              </TableCell>
              <TableCell>
                {user.avg_time_variance ? (
                  <span className={user.avg_time_variance < 0 ? 'text-green-600' : 'text-red-600'}>
                    {user.avg_time_variance > 0 ? '+' : ''}{user.avg_time_variance.toFixed(1)}h
                  </span>
                ) : 'N/A'}
              </TableCell>
              <TableCell className="w-24">
                <Progress 
                  value={user.completion_rate || 0} 
                  className="h-2" 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
