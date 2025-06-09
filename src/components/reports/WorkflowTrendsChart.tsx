
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWorkflowTrends } from '@/hooks/useAnalytics';
import { format } from 'date-fns';

export function WorkflowTrendsChart() {
  const { data: trends, isLoading, error } = useWorkflowTrends(30);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading trends...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-red-500">Error loading trends</div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">No trend data available</div>
      </div>
    );
  }

  const chartData = trends
    .slice()
    .reverse()
    .map(trend => ({
      date: format(new Date(trend.date), 'MMM dd'),
      created: trend.workflows_created || 0,
      completed: trend.workflows_completed || 0,
      active: trend.workflows_active || 0,
      paused: trend.workflows_paused || 0,
    }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Created"
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="active" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Active"
          />
          <Line 
            type="monotone" 
            dataKey="paused" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Paused"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
