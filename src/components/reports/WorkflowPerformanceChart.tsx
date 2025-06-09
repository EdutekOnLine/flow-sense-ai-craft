
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWorkflowAnalytics } from '@/hooks/useAnalytics';

interface WorkflowPerformanceChartProps {
  detailed?: boolean;
}

export function WorkflowPerformanceChart({ detailed = false }: WorkflowPerformanceChartProps) {
  const { data: workflows, isLoading, error } = useWorkflowAnalytics();

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading workflow performance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-red-500">Error loading workflow performance</div>
      </div>
    );
  }

  if (!workflows || workflows.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">No workflow data available</div>
      </div>
    );
  }

  const chartData = workflows.slice(0, detailed ? 20 : 10).map(workflow => ({
    name: workflow.name.length > 15 ? workflow.name.substring(0, 15) + '...' : workflow.name,
    completion: workflow.completion_percentage || 0,
    totalSteps: workflow.total_steps || 0,
    completedSteps: workflow.completed_steps || 0,
    estimatedHours: workflow.total_estimated_hours || 0,
    actualHours: workflow.total_actual_hours || 0,
  }));

  return (
    <div className={detailed ? "h-96" : "h-64"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'completion') return [`${value}%`, 'Completion Rate'];
              if (name === 'totalSteps') return [value, 'Total Steps'];
              if (name === 'completedSteps') return [value, 'Completed Steps'];
              if (name === 'estimatedHours') return [`${value}h`, 'Estimated Hours'];
              if (name === 'actualHours') return [`${value}h`, 'Actual Hours'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            dataKey="completion" 
            fill="#3b82f6" 
            name="Completion %" 
          />
          {detailed && (
            <>
              <Bar 
                dataKey="totalSteps" 
                fill="#10b981" 
                name="Total Steps" 
              />
              <Bar 
                dataKey="completedSteps" 
                fill="#f59e0b" 
                name="Completed Steps" 
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
