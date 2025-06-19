
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { formatLocalizedDistanceToNow } from '@/utils/localization';
import { CheckCircle, Clock, PlayCircle, Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'workflow_started' | 'workflow_completed';
  title: string;
  description: string;
  timestamp: string;
  isNew?: boolean;
}

const ActivityItemComponent = memo(({ activity }: { activity: ActivityItem }) => {
  const { t, i18n } = useTranslation();
  
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_assigned':
        return <Clock className="h-4 w-4 text-secondary" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'workflow_started':
        return <PlayCircle className="h-4 w-4 text-primary" />;
      case 'workflow_completed':
        return <Activity className="h-4 w-4 text-primary" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
        activity.isNew ? 'bg-accent/20 border border-accent/40 animate-pulse' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {activity.title}
          {activity.isNew && (
            <Badge className="ml-2 bg-accent text-accent-foreground text-xs">
              NEW
            </Badge>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatLocalizedDistanceToNow(new Date(activity.timestamp), i18n.language)}
        </p>
      </div>
    </div>
  );
});

ActivityItemComponent.displayName = 'ActivityItemComponent';

export const OptimizedRealtimeActivityFeed = memo(() => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const fetchRecentActivity = useCallback(async () => {
    if (!profile || !isMountedRef.current) return;

    try {
      // Fetch recent task assignments
      const { data: assignments } = await supabase
        .from('workflow_step_assignments')
        .select(`
          id,
          status,
          created_at,
          workflow_steps (
            name,
            workflows (name)
          )
        `)
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!isMountedRef.current) return;

      const activityItems: ActivityItem[] = [];

      assignments?.forEach(assignment => {
        if (assignment.status === 'completed') {
          activityItems.push({
            id: `task-${assignment.id}`,
            type: 'task_completed',
            title: t('activity.taskCompleted'),
            description: `${assignment.workflow_steps.name} in ${assignment.workflow_steps.workflows.name}`,
            timestamp: assignment.created_at,
          });
        } else {
          activityItems.push({
            id: `task-${assignment.id}`,
            type: 'task_assigned',
            title: t('activity.taskAssigned'),
            description: `${assignment.workflow_steps.name} in ${assignment.workflow_steps.workflows.name}`,
            timestamp: assignment.created_at,
          });
        }
      });

      // Sort by timestamp and take latest 5
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (isMountedRef.current) {
        setActivities(activityItems.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [profile, t]);

  const addNewActivity = useCallback((activity: ActivityItem) => {
    if (!isMountedRef.current) return;
    
    setActivities(prev => {
      const newActivity = { ...activity, isNew: true };
      const updated = [newActivity, ...prev].slice(0, 5);
      
      // Remove "new" flag after 3 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          setActivities(current => 
            current.map(item => 
              item.id === activity.id ? { ...item, isNew: false } : item
            )
          );
        }
      }, 3000);
      
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!profile) return;

    fetchRecentActivity();

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Set up real-time subscription for new assignments
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_step_assignments',
          filter: `assigned_to=eq.${profile.id}`
        },
        async (payload) => {
          if (!isMountedRef.current) return;
          
          // Fetch the workflow step details for the new assignment
          const { data: stepData } = await supabase
            .from('workflow_steps')
            .select(`
              name,
              workflows (name)
            `)
            .eq('id', payload.new.workflow_step_id)
            .single();

          if (stepData && isMountedRef.current) {
            addNewActivity({
              id: `task-new-${payload.new.id}`,
              type: 'task_assigned',
              title: t('activity.newTaskAssigned'),
              description: `${stepData.name} in ${stepData.workflows.name}`,
              timestamp: payload.new.created_at,
              isNew: true
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profile?.id, t, fetchRecentActivity, addNewActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('dashboard.recentActivity')}</h3>
        <Badge variant="secondary" className="animate-pulse bg-accent text-accent-foreground">
          LIVE
        </Badge>
      </div>
      
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          {t('dashboard.noRecentActivity')}
        </p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityItemComponent key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
});

OptimizedRealtimeActivityFeed.displayName = 'OptimizedRealtimeActivityFeed';
