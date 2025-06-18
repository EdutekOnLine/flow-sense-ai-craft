
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
    id: 'workflow-inbox',
    label: 'navigation.myTasks',
    icon: Inbox,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-flow',
    group: 'workflow'
  },
  {
    id: 'workflow-builder',
    label: 'navigation.workflowBuilder',
    icon: Workflow,
    roles: ['admin', 'manager', 'root'],
    module: 'neura-flow',
    group: 'workflow'
  },
  {
    id: 'templates',
    label: 'navigation.templates',
    icon: FileText,
    roles: ['admin', 'manager', 'employee', 'root'],
    module: 'neura-flow',
    group: 'workflow'
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Building2,
    roles: ['admin', 'manager', 'employee', 'root'],
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

export const getGroupTitle = (groupKey: string): string => {
  const titles: Record<string, string> = {
    core: 'Core',
    workflow: 'Workflow',
    modules: 'Modules',
    admin: 'Administration'
  };
  return titles[groupKey] || groupKey;
};
