import { Home, Kanban, ListChecks, Users, Settings, BarChart3, Building2, TrendingUp, CheckSquare, MessageSquare, LayoutDashboard } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: NavigationItem[];
  collapsible?: boolean;
}

export const getNavigationItems = (canAccessModule: (moduleId: string) => boolean): NavigationItem[] => {
  const items: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },
    // Workflow Module
    ...(canAccessModule('neura-flow') ? [
      {
        id: 'workflow',
        label: 'Workflow',
        icon: Kanban,
        collapsible: true,
        children: [
          {
            id: 'workflow-dashboard',
            label: 'Workflow Dashboard',
            icon: LayoutDashboard,
          },
          {
            id: 'workflow-inbox',
            label: 'Workflow Inbox',
            icon: ListChecks,
          },
          {
            id: 'workflow-builder',
            label: 'Workflow Builder',
            icon: Home,
          },
          {
            id: 'templates',
            label: 'Templates',
            icon: Home,
          },
          {
            id: 'workflow-analytics',
            label: 'Analytics',
            icon: BarChart3,
          },
        ],
      },
    ] : []),

    // CRM Module
    ...(canAccessModule('neura-crm') ? [
      {
        id: 'crm',
        label: 'CRM',
        icon: 'building-2',
        collapsible: true,
        children: [
          {
            id: 'crm-dashboard',
            label: 'CRM Dashboard',
            icon: 'layout-dashboard',
          },
          {
            id: 'crm-contacts',
            label: 'Contacts',
            icon: 'users',
          },
          {
            id: 'crm-companies',
            label: 'Companies',
            icon: 'building-2',
          },
          {
            id: 'crm-pipeline',
            label: 'Sales Pipeline',
            icon: 'trending-up',
          },
          {
            id: 'crm-tasks',
            label: 'Tasks',
            icon: 'check-square',
          },
          {
            id: 'crm-communications',
            label: 'Communications',
            icon: 'message-square',
          },
          {
            id: 'crm-analytics',
            label: 'Analytics',
            icon: 'bar-chart-3',
          },
        ],
      },
    ] : []),

    // Forms Module
    ...(canAccessModule('neura-forms') ? [
      {
        id: 'forms',
        label: 'Forms',
        icon: ListChecks,
        collapsible: false,
      },
    ] : []),

    // Education Module
    ...(canAccessModule('neura-edu') ? [
      {
        id: 'education',
        label: 'Education',
        icon: Users,
        collapsible: false,
      },
    ] : []),

    // Admin section - always visible, but individual items can be gated
    {
      id: 'admin',
      label: 'Admin',
      icon: Settings,
      collapsible: true,
      children: [
        {
          id: 'users',
          label: 'Users',
          icon: Users,
          href: '/admin/users',
        },
        {
          id: 'teams',
          label: 'Teams',
          icon: Users,
          href: '/admin/teams',
        },
        {
          id: 'workspace-management',
          label: 'Workspaces',
          icon: Building2,
          href: '/admin/workspaces',
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: BarChart3,
        },
        {
          id: 'module-management',
          label: 'Modules',
          icon: Home,
          href: '/admin/modules',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return items;
};
