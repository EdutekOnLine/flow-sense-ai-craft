
import { useState, useEffect } from 'react';
import { useModulePermissions } from './useModulePermissions';
import { useRealtimeDashboardMetrics } from './useRealtimeDashboardMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ModuleDashboardData {
  moduleMetrics: Record<string, any>;
  moduleActivities: Array<{
    id: string;
    module: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    isNew?: boolean;
  }>;
  quickActions: Array<{
    id: string;
    module: string;
    label: string;
    action: string;
    icon: string;
  }>;
}

export function useModuleDashboardData() {
  const { profile } = useAuth();
  const { getAccessibleModules, canAccessModule } = useModulePermissions();
  const { metrics: workflowMetrics } = useRealtimeDashboardMetrics();
  const [moduleDashboardData, setModuleDashboardData] = useState<ModuleDashboardData>({
    moduleMetrics: {},
    moduleActivities: [],
    quickActions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchModuleData = async () => {
    if (!profile) return;

    const accessibleModules = getAccessibleModules();
    const newData: ModuleDashboardData = {
      moduleMetrics: {},
      moduleActivities: [],
      quickActions: []
    };

    // Add NeuraFlow data if accessible
    if (canAccessModule('neura-flow')) {
      newData.moduleMetrics['neura-flow'] = workflowMetrics;
      newData.quickActions.push(
        {
          id: 'create-workflow',
          module: 'neura-flow',
          label: 'Create Workflow',
          action: 'workflow-builder',
          icon: 'Plus'
        },
        {
          id: 'view-tasks',
          module: 'neura-flow',
          label: 'View My Tasks',
          action: 'workflow-inbox',
          icon: 'CheckSquare'
        }
      );
    }

    // Add NeuraCRM data if accessible
    if (canAccessModule('neura-crm')) {
      newData.moduleMetrics['neura-crm'] = {
        totalLeads: 0,
        activeDeals: 0,
        monthlyRevenue: 0,
        conversionRate: 0
      };
      newData.quickActions.push({
        id: 'add-lead',
        module: 'neura-crm',
        label: 'Add Lead',
        action: 'crm',
        icon: 'UserPlus'
      });
    }

    // Add NeuraForms data if accessible
    if (canAccessModule('neura-forms')) {
      newData.moduleMetrics['neura-forms'] = {
        totalForms: 0,
        submissions: 0,
        responseRate: 0,
        activeForms: 0
      };
      newData.quickActions.push({
        id: 'create-form',
        module: 'neura-forms',
        label: 'Create Form',
        action: 'forms',
        icon: 'FileText'
      });
    }

    // Add NeuraEdu data if accessible
    if (canAccessModule('neura-edu')) {
      newData.moduleMetrics['neura-edu'] = {
        totalCourses: 0,
        activeStudents: 0,
        completionRate: 0,
        assignmentsDue: 0
      };
      newData.quickActions.push({
        id: 'create-course',
        module: 'neura-edu',
        label: 'Create Course',
        action: 'education',
        icon: 'BookOpen'
      });
    }

    // Always add core actions
    newData.quickActions.push({
      id: 'view-reports',
      module: 'neura-core',
      label: 'View Reports',
      action: 'reports',
      icon: 'BarChart3'
    });

    setModuleDashboardData(newData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchModuleData();
  }, [profile?.id, canAccessModule]);

  return {
    data: moduleDashboardData,
    isLoading,
    refresh: fetchModuleData
  };
}
