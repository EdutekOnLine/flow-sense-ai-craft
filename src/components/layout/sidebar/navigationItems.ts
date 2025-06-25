import { 
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Workflow,
  Inbox,
  Building2,
  FormInput,
  GraduationCap,
  Package,
  Building,
  UserPlus,
  Briefcase,
  CheckSquare,
  TrendingUp,
  PieChart,
  UserCheck,
  Layers,
  Users2,
  Activity
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  module: string;
  group: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'navigation.dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-core',
    group: 'core'
  },
  {
    id: 'workflow-dashboard',
    label: 'Workflow Dashboard',
    icon: Activity,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-flow',
    group: 'modules'
  },
  {
    id: 'workflow-inbox',
    label: 'navigation.myTasks',
    icon: Inbox,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-flow',
    group: 'modules'
  },
  {
    id: 'workflow-builder',
    label: 'navigation.workflowBuilder',
    icon: Workflow,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-flow',
    group: 'modules'
  },
  {
    id: 'templates',
    label: 'navigation.templates',
    icon: FileText,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-flow',
    group: 'modules'
  },
  {
    id: 'workflow-analytics',
    label: 'Workflow Analytics',
    icon: PieChart,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-flow',
    group: 'modules'
  },
  {
    id: 'crm-dashboard',
    label: 'CRM Dashboard',
    icon: Briefcase,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-crm',
    group: 'modules'
  },
  {
    id: 'crm-contacts',
    label: 'Contacts',
    icon: UserPlus,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-crm',
    group: 'modules'
  },
  {
    id: 'crm-companies',
    label: 'Companies',
    icon: Building2,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-crm',
    group: 'modules'
  },
  {
    id: 'crm-tasks',
    label: 'CRM Tasks',
    icon: CheckSquare,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-crm',
    group: 'modules'
  },
  {
    id: 'crm-pipeline',
    label: 'Pipeline',
    icon: TrendingUp,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-crm',
    group: 'modules'
  },
  {
    id: 'crm-analytics',
    label: 'CRM Analytics',
    icon: PieChart,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-crm',
    group: 'modules'
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: FormInput,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-forms',
    group: 'modules'
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-edu',
    group: 'modules'
  },
  {
    id: 'users',
    label: 'navigation.users',
    icon: Users,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-core',
    group: 'admin'
  },
  {
    id: 'teams',
    label: 'Team Management',
    icon: Users2,
    roles: ['admin', 'root'],
    module: 'neura-core',
    group: 'admin'
  },
  {
    id: 'workspace-management',
    label: 'Workspace Management',
    icon: Building,
    roles: ['root'],
    module: 'neura-core',
    group: 'admin'
  },
  {
    id: 'reports',
    label: 'navigation.reports',
    icon: BarChart3,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-core',
    group: 'admin'
  },
  {
    id: 'module-management',
    label: 'Module Management',
    icon: Package,
    roles: ['root'],
    module: 'neura-core',
    group: 'admin'
  },
  {
    id: 'settings',
    label: 'navigation.settings',
    icon: Settings,
    roles: ['admin', 'root'],
    module: 'neura-core',
    group: 'admin'
  },
];

export const adminNavigation = [
  {
    title: 'User Management',
    icon: UserCheck,
    href: '/admin/users',
    description: 'Manage users, invitations, and permissions',
    requiresAuth: true,
    roles: ['admin', 'root'],
  },
  {
    title: 'Team Management',
    icon: Users2,
    href: '/admin/teams',
    description: 'Organize users into teams and assign managers',
    requiresAuth: true,
    roles: ['admin', 'root'],
  },
  {
    title: 'Workspace Management',
    icon: Building2,
    href: '/admin/workspaces',
    description: 'Configure workspace settings and structure',
    requiresAuth: true,
    roles: ['root'],
  },
  {
    title: 'Module Management',
    icon: Layers,
    href: '/admin/modules',
    description: 'Enable and configure workspace modules',
    requiresAuth: true,
    roles: ['admin', 'root'],
  },
];

export const getGroupTitle = (groupKey: string): string => {
  const titles: Record<string, string> = {
    core: 'Core',
    modules: 'Modules',
    admin: 'Administration'
  };
  return titles[groupKey] || groupKey;
};
