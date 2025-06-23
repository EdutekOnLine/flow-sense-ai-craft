
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserActivity } from '@/hooks/useUserActivity';
import { 
  Activity, 
  Settings, 
  Workflow, 
  Users, 
  FileText, 
  BookOpen,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function MyRecentActivityTimeline() {
  const { recentActivity, isLoading } = useUserActivity();

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case 'neura-core': return Settings;
      case 'neura-flow': return Workflow;
      case 'neura-crm': return Users;
      case 'neura-forms': return FileText;
      case 'neura-edu': return BookOpen;
      default: return Activity;
    }
  };

  const getModuleDisplayName = (moduleName: string) => {
    const displayNames: Record<string, string> = {
      'neura-core': 'NeuraCore',
      'neura-flow': 'NeuraFlow',
      'neura-crm': 'NeuraCRM',
      'neura-forms': 'NeuraForms',
      'neura-edu': 'NeuraEdu'
    };
    return displayNames[moduleName] || moduleName;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'activated': return 'bg-status-success text-foreground';
      case 'deactivated': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            My Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentActivity.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            My Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity yet</p>
            <p className="text-sm">Your module management actions will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          My Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const IconComponent = getModuleIcon(activity.module_name);
            const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                <div className="p-2 bg-primary/10 rounded-full">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} {getModuleDisplayName(activity.module_name)}
                    </p>
                    <Badge className={getActionColor(activity.action)} variant="secondary">
                      {activity.action}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo}</span>
                  </div>
                  {activity.reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {activity.reason}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
