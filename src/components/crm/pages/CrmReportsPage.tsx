
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCrmData } from '@/hooks/useCrmData';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  CheckSquare, 
  Calendar,
  Target,
  DollarSign
} from 'lucide-react';

export function CrmReportsPage() {
  const { contacts, companies, tasks, metrics, isLoading } = useCrmData();

  const statusBreakdown = {
    lead: contacts.filter(c => c.status === 'lead').length,
    prospect: contacts.filter(c => c.status === 'prospect').length,
    customer: contacts.filter(c => c.status === 'customer').length,
    inactive: contacts.filter(c => c.status === 'inactive').length,
  };

  const taskStatusBreakdown = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  const leadSources = {
    website: contacts.filter(c => c.lead_source === 'website').length,
    referral: contacts.filter(c => c.lead_source === 'referral').length,
    social_media: contacts.filter(c => c.lead_source === 'social_media').length,
    email_campaign: contacts.filter(c => c.lead_source === 'email_campaign').length,
    cold_call: contacts.filter(c => c.lead_source === 'cold_call').length,
    trade_show: contacts.filter(c => c.lead_source === 'trade_show').length,
    other: contacts.filter(c => c.lead_source === 'other').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">CRM Reports</h1>
        <p className="text-muted-foreground">Analytics and insights for your CRM data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    status === 'customer' ? 'default' :
                    status === 'prospect' ? 'secondary' :
                    status === 'lead' ? 'outline' : 'destructive'
                  }>
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(taskStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    status === 'completed' ? 'default' :
                    status === 'in_progress' ? 'secondary' :
                    status === 'pending' ? 'outline' : 'destructive'
                  }>
                    {status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(leadSources)
              .filter(([_, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="capitalize">{source.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count}</span>
                  <span className="text-sm text-muted-foreground">
                    ({contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>New Contacts This Week</span>
              <span className="font-medium">{metrics.newContactsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tasks Completed</span>
              <span className="font-medium">{metrics.tasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Upcoming Tasks</span>
              <span className="font-medium">{metrics.upcomingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Deals</span>
              <span className="font-medium">{metrics.activeDeals}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">${metrics.monthlyRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-700">Monthly Revenue</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{metrics.conversionRate}%</p>
              <p className="text-sm text-blue-700">Conversion Rate</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{metrics.activeDeals}</p>
              <p className="text-sm text-purple-700">Active Deals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
