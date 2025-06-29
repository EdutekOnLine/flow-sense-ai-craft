
import { Home, Kanban, ListChecks, Users, Settings, BarChart3, Building2, TrendingUp, CheckSquare, MessageSquare, LayoutDashboard } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: NavigationItem[];
  collapsible?: boolean;
  roles: string[];
  module: string;
  group: string;
}

export const getGroupTitle = (groupKey: string): string => {
  const groupTitles: Record<string, string> = {
    'core': 'Core',
    'modules': 'Modules',
    'admin': 'Administration'
  };
  return groupTitles[groupKey] || groupKey;
};

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    roles: ['user', 'admin', 'root'],
    module: 'neura-core',
    group: 'core',
  },
  // Workflow Module
  {
    id: 'workflow',
    label: 'Workflow',
    icon: Kanban,
    collapsible: true,
    roles: ['user', 'admin', 'root'],
    module: 'neura-flow',
    group: 'modules',
    children: [
      {
        id: 'workflow-dashboard',
        label: 'Workflow Dashboard',
        icon: LayoutDashboard,
        roles: ['user', 'admin', 'root'],
        module: 'neura-flow',
        group: 'modules',
      },
      {
        id: 'workflow-inbox',
        label: 'Workflow Inbox',
        icon: ListChecks,
        roles: ['user', 'admin', 'root'],
        module: 'neura-flow',
        group: 'modules',
      },
      {
        id: 'workflow-builder',
        label: 'Workflow Builder',
        icon: Home,
        roles: ['user', 'admin', 'root'],
        module: 'neura-flow',
        group: 'modules',
      },
      {
        id: 'templates',
        label: 'Templates',
        icon: Home,
        roles: ['user', 'admin', 'root'],
        module: 'neura-flow',
        group: 'modules',
      },
      {
        id: 'workflow-analytics',
        label: 'Analytics',
        icon: BarChart3,
        roles: ['user', 'admin', 'root'],
        module: 'neura-flow',
        group: 'modules',
      },
    ],
  },
  // CRM Module
  {
    id: 'crm',
    label: 'CRM',
    icon: Building2,
    collapsible: true,
    roles: ['user', 'admin', 'root'],
    module: 'neura-crm',
    group: 'modules',
    children: [
      {
        id: 'crm-dashboard',
        label: 'CRM Dashboard',
        icon: LayoutDashboard,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
      {
        id: 'crm-contacts',
        label: 'Contacts',
        icon: Users,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
      {
        id: 'crm-companies',
        label: 'Companies',
        icon: Building2,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
      {
        id: 'crm-pipeline',
        label: 'Sales Pipeline',
        icon: TrendingUp,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
      {
        id: 'crm-tasks',
        label: 'Tasks',
        icon: CheckSquare,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
      {
        id: 'crm-communications',
        label: 'Communications',
        icon: MessageSquare,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
      {
        id: 'crm-analytics',
        label: 'Analytics',
        icon: BarChart3,
        roles: ['user', 'admin', 'root'],
        module: 'neura-crm',
        group: 'modules',
      },
    ],
  },
  // Forms Module
  {
    id: 'forms',
    label: 'Forms',
    icon: ListChecks,
    collapsible: false,
    roles: ['user', 'admin', 'root'],
    module: 'neura-forms',
    group: 'modules',
  },
  // Education Module
  {
    id: 'education',
    label: 'Education',
    icon: Users,
    collapsible: false,
    roles: ['user', 'admin', 'root'],
    module: 'neura-edu',
    group: 'modules',
  },
  // Admin section
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    collapsible: true,
    roles: ['admin', 'root'],
    module: 'neura-core',
    group: 'admin',
    children: [
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        href: '/admin/users',
        roles: ['admin', 'root'],
        module: 'neura-core',
        group: 'admin',
      },
      {
        id: 'teams',
        label: 'Teams',
        icon: Users,
        href: '/admin/teams',
        roles: ['admin', 'root'],
        module: 'neura-core',
        group: 'admin',
      },
      {
        id: 'workspace-management',
        label: 'Workspaces',
        icon: Building2,
        href: '/admin/workspaces',
        roles: ['admin', 'root'],
        module: 'neura-core',
        group: 'admin',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: BarChart3,
        roles: ['admin', 'root'],
        module: 'neura-core',
        group: 'admin',
      },
      {
        id: 'module-management',
        label: 'Modules',
        icon: Home,
        href: '/admin/modules',
        roles: ['admin', 'root'],
        module: 'neura-core',
        group: 'admin',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        roles: ['admin', 'root'],
        module: 'neura-core',
        group: 'admin',
      },
    ],
  },
];

export const getNavigationItems = (canAccessModule: (moduleId: string) => boolean): NavigationItem[] => {
  return navigationItems.filter(item => {
    // Filter based on module access
    const hasModuleAccess = canAccessModule(item.module);
    
    if (!hasModuleAccess) {
      return false;
    }
    
    // If item has children, filter them too
    if (item.children) {
      item.children = item.children.filter(child => canAccessModule(child.module));
    }
    
    return true;
  });
};
