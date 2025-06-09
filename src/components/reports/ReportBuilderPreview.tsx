
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LineChart, PieChart, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportBuilderPreviewProps {
  config: {
    name: string;
    type: string;
    visualization: string;
    dateRange: { from?: Date; to?: Date } | undefined;
    filters: Record<string, string>;
    groupBy: string;
  };
}

const sampleData = [
  { name: 'Engineering', completed: 24, pending: 8, efficiency: 85 },
  { name: 'Marketing', completed: 18, pending: 5, efficiency: 78 },
  { name: 'Sales', completed: 32, pending: 12, efficiency: 92 },
  { name: 'HR', completed: 15, pending: 3, efficiency: 83 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportBuilderPreview({ config }: ReportBuilderPreviewProps) {
  const renderVisualization = () => {
    switch (config.visualization) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#0088FE" />
              <Bar dataKey="pending" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#00C49F" strokeWidth={2} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={sampleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="completed"
              >
                {sampleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Select a visualization type to preview</p>
            </div>
          </div>
        );
    }
  };

  const getVisualizationIcon = () => {
    switch (config.visualization) {
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'line': return <TrendingUp className="h-4 w-4" />;
      case 'pie': return <PieChart className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getVisualizationIcon()}
                {config.name || 'Untitled Report'}
              </CardTitle>
              <CardDescription>
                {config.type} • {config.groupBy ? `Grouped by ${config.groupBy}` : 'No grouping'}
              </CardDescription>
            </div>
            <Badge variant="outline">Preview</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderVisualization()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Type:</span>
              <p className="capitalize">{config.type}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Visualization:</span>
              <p className="capitalize">{config.visualization || 'None selected'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Date Range:</span>
              <p>
                {config.dateRange?.from && config.dateRange?.to
                  ? `${config.dateRange.from.toLocaleDateString()} - ${config.dateRange.to.toLocaleDateString()}`
                  : 'Not set'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Group By:</span>
              <p className="capitalize">{config.groupBy || 'None'}</p>
            </div>
          </div>
          
          {Object.keys(config.filters).length > 0 && (
            <div>
              <span className="font-medium text-gray-600 block mb-2">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(config.filters).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
