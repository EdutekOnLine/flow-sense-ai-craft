
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
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

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SidebarNavigation({ activeTab, onTabChange }: SidebarNavigationProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { canAccessModule, getModuleStatus } = useModulePermissions();

  const navigationItems = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee', 'root'],
      module: 'neura-core',
      group: 'core'
    },
    {
      id: 'workflow-inbox',
      label: t('navigation.myTasks'),
      icon: Inbox,
      roles: ['admin', 'manager', 'employee', 'root'],
      module: 'neura-flow',
      group: 'workflow'
    },
    {
      id: 'workflow-builder',
      label: t('navigation.workflowBuilder'),
      icon: Workflow,
      roles: ['admin', 'manager', 'root'],
      module: 'neura-flow',
      group: 'workflow'
    },
    {
      id: 'templates',
      label: t('navigation.templates'),
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
      label: t('navigation.users'),
      icon: Users,
      roles: ['admin', 'manager', 'root'],
      module: 'neura-core',
      group: 'admin'
    },
    {
      id: 'reports',
      label: t('navigation.reports'),
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
      label: t('navigation.settings'),
      icon: Settings,
      roles: ['admin', 'root'],
      module: 'neura-core',
      group: 'admin'
    },
  ];

  const getVisibleItems = () => {
    return navigationItems.filter(item => 
      item.roles.includes(profile?.role || 'employee') && canAccessModule(item.module)
    );
  };

  const groupItems = (items: typeof navigationItems) => {
    const groups = items.reduce((acc, item) => {
      const group = item.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {} as Record<string, typeof navigationItems>);

    return groups;
  };

  const getGroupTitle = (groupKey: string) => {
    const titles: Record<string, string> = {
      core: 'Core',
      workflow: 'Workflow',
      modules: 'Modules',
      admin: 'Administration'
    };
    return titles[groupKey] || groupKey;
  };

  const getModuleBadge = (moduleName: string) => {
    if (moduleName === 'neura-core') return null;
    
    const status = getModuleStatus(moduleName);
    if (!status.isActive) {
      return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
    }
    return null;
  };

  const visibleItems = getVisibleItems();
  const groupedItems = groupItems(visibleItems);

  return (
    <SidebarContent>
      {Object.entries(groupedItems).map(([groupKey, items]) => (
        <SidebarGroup key={groupKey}>
          <SidebarGroupLabel>{getGroupTitle(groupKey)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const moduleBadge = getModuleBadge(item.module);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={isActive}
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {moduleBadge}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
