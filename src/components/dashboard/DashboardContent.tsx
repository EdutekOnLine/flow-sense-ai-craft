
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UserManagement from '@/components/admin/UserManagement';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Workflow,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export default function DashboardContent() {
  const { profile } = useAuth();

  const stats = [
    {
      title: 'Active Workflows',
      value: '12',
      description: 'Currently in progress',
      icon: Workflow,
      color: 'text-blue-600',
    },
    {
      title: 'Completed Tasks',
      value: '48',
      description: 'This month',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Pending Reviews',
      value: '5',
      description: 'Awaiting approval',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Team Members',
      value: '8',
      description: 'Active users',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Workflow "Q1 Marketing Campaign" completed',
      time: '2 hours ago',
      type: 'completed',
    },
    {
      id: 2,
      action: 'New task assigned: "Design Review"',
      time: '4 hours ago',
      type: 'assigned',
    },
    {
      id: 3,
      action: 'Workflow "Product Launch" started',
      time: '1 day ago',
      type: 'started',
    },
    {
      id: 4,
      action: 'User John Doe joined the team',
      time: '2 days ago',
      type: 'user',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'assigned':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'started':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your workflows today.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {profile?.role?.toUpperCase()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your workflows and team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">Create New Workflow</div>
              <div className="text-xs text-gray-600">Start a new process</div>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">Review Pending Tasks</div>
              <div className="text-xs text-gray-600">Check items awaiting approval</div>
            </button>
            
            {profile?.role === 'admin' && (
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Manage Users</div>
                <div className="text-xs text-gray-600">Invite or manage team members</div>
              </button>
            )}
            
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium text-sm">View Reports</div>
              <div className="text-xs text-gray-600">Analyze workflow performance</div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Content Based on Active Tab */}
      {window.location.hash === '#users' && profile?.role === 'admin' && (
        <UserManagement />
      )}
    </div>
  );
}
