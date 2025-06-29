
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Phone, Mail, Users, FileText, TrendingUp, Clock } from 'lucide-react';
import { useCrmCommunications } from '@/hooks/useCrmCommunications';

interface CommunicationMetricsProps {
  entityId: string;
  entityType: 'contact' | 'company' | 'deal';
}

export function CommunicationMetrics({ entityId, entityType }: CommunicationMetricsProps) {
  const { communications, isLoading } = useCrmCommunications(entityId, entityType);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalCommunications = communications.length;
  const typeBreakdown = communications.reduce((acc, comm) => {
    acc[comm.type] = (acc[comm.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentCommunications = communications.filter(comm => {
    const commDate = new Date(comm.communication_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return commDate >= thirtyDaysAgo;
  }).length;

  const avgPerMonth = communications.length > 0 ? (communications.length / Math.max(1, 
    Math.ceil((Date.now() - new Date(communications[communications.length - 1]?.created_at || Date.now()).getTime()) / (30 * 24 * 60 * 60 * 1000))
  )).toFixed(1) : '0';

  // Chart data
  const typeChartData = Object.entries(typeBreakdown).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    color: {
      call: '#3B82F6',
      email: '#10B981',
      meeting: '#8B5CF6',
      note: '#6B7280'
    }[type] || '#6B7280'
  }));

  const monthlyData = communications.reduce((acc, comm) => {
    const month = new Date(comm.communication_date).toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6)
    .map(([month, count]) => ({ month, count }));

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommunications}</div>
            <p className="text-xs text-muted-foreground">
              All time communications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCommunications}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerMonth}</div>
            <p className="text-xs text-muted-foreground">
              Communications per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Type</CardTitle>
            {getTypeIcon(Object.entries(typeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'note')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {Object.entries(typeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(typeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} times
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Communication Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {typeChartData.map(({ type, count, color }) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Communication Type Distribution */}
      {typeChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Communication Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
