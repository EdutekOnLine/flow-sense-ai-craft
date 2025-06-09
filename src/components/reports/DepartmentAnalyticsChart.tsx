
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDepartmentAnalytics } from '@/hooks/useAnalytics';

export function DepartmentAnalyticsChart() {
  const { data: departments, isLoading, error } = useDepartmentAnalytics();

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading department analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-red-500">Error loading department analytics</div>
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">No department data available</div>
      </div>
    );
  }

  const chartData = departments.map(dept => ({
    department: dept.department || 'Unknown',
    users: dept.total_users || 0,
    workflows: dept.workflows_created || 0,
    completionRate: dept.department_completion_rate || 0,
    timeVariance: dept.avg_time_variance || 0,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="department" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'completionRate') return [`${value}%`, 'Completion Rate'];
              if (name === 'timeVariance') return [`${value}h`, 'Avg Time Variance'];
              if (name === 'users') return [value, 'Total Users'];
              if (name === 'workflows') return [value, 'Workflows Created'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            dataKey="completionRate" 
            fill="#3b82f6" 
            name="Completion Rate %" 
          />
          <Bar 
            dataKey="users" 
            fill="#10b981" 
            name="Total Users" 
          />
          <Bar 
            dataKey="workflows" 
            fill="#f59e0b" 
            name="Workflows Created" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
