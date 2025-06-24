
import { useQuery } from '@tanstack/react-query';
import { useModulePermissions } from './useModulePermissions';
import { useCrmData } from './useCrmData';

interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon: string;
  module: string;
}

interface ModuleMetrics {
  [key: string]: any;
}

interface ModuleDashboardData {
  quickActions: QuickAction[];
  moduleMetrics: ModuleMetrics;
}

export function useModuleDashboardData() {
  const { canAccessModule, getAccessibleModules } = useModulePermissions();
  const { metrics: crmMetrics, isLoading: crmLoading } = useCrmData();

  return useQuery({
    queryKey: ['module-dashboard-data', getAccessibleModules()],
    queryFn: async (): Promise<ModuleDashboardData> => {
      const quickActions: QuickAction[] = [];
      const moduleMetrics: ModuleMetrics = {};

      // NeuraFlow Quick Actions
      if (canAccessModule('neura-flow')) {
        quickActions.push(
          {
            id: 'create-workflow',
            label: 'Create Workflow',
            action: '#workflow-builder',
            icon: 'Plus',
            module: 'neura-flow'
          },
          {
            id: 'view-tasks',
            label: 'My Tasks',
            action: '#workflow-inbox',
            icon: 'CheckSquare',
            module: 'neura-flow'
          }
        );
      }

      // NeuraCRM Quick Actions
      if (canAccessModule('neura-crm')) {
        quickActions.push(
          {
            id: 'add-contact',
            label: 'Add Contact',
            action: '#crm/contacts/new',
            icon: 'UserPlus',
            module: 'neura-crm'
          },
          {
            id: 'add-company',
            label: 'Add Company',
            action: '#crm/companies/new',
            icon: 'Building2',
            module: 'neura-crm'
          },
          {
            id: 'crm-dashboard',
            label: 'CRM Dashboard',
            action: '#crm',
            icon: 'BarChart3',
            module: 'neura-crm'
          }
        );

        // Include CRM metrics
        moduleMetrics['neura-crm'] = crmMetrics;
      }

      // NeuraForms Quick Actions
      if (canAccessModule('neura-forms')) {
        quickActions.push(
          {
            id: 'create-form',
            label: 'Create Form',
            action: '#forms/new',
            icon: 'FileText',
            module: 'neura-forms'
          }
        );

        // Mock metrics for forms
        moduleMetrics['neura-forms'] = {
          submissions: Math.floor(Math.random() * 1000) + 100,
          activeForms: Math.floor(Math.random() * 20) + 5,
          conversionRate: Math.floor(Math.random() * 100),
        };
      }

      // NeuraEdu Quick Actions
      if (canAccessModule('neura-edu')) {
        quickActions.push(
          {
            id: 'create-course',
            label: 'Create Course',
            action: '#education/courses/new',
            icon: 'BookOpen',
            module: 'neura-edu'
          }
        );

        // Mock metrics for education
        moduleMetrics['neura-edu'] = {
          activeStudents: Math.floor(Math.random() * 500) + 50,
          completionRate: Math.floor(Math.random() * 100),
          coursesCreated: Math.floor(Math.random() * 50) + 10,
        };
      }

      return {
        quickActions,
        moduleMetrics,
      };
    },
    enabled: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
