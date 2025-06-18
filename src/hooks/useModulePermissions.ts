
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';

export interface ModuleStatus {
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
}

export function useModulePermissions() {
  const { profile } = useAuth();
  const { isModuleActive, activeModules, allModules, workspaceModules } = useWorkspace();

  // Get detailed module status
  const getModuleStatus = (moduleName: string): ModuleStatus => {
    if (!profile) {
      return {
        isActive: false,
        isAvailable: false,
        isRestricted: true,
        statusMessage: 'Authentication required'
      };
    }

    // Core module is always available to authenticated users
    if (moduleName === 'neura-core') {
      return {
        isActive: true,
        isAvailable: true,
        isRestricted: false
      };
    }

    const isActive = isModuleActive(moduleName);
    const moduleExists = allModules?.some(m => m.name === moduleName) || false;
    
    if (!moduleExists) {
      return {
        isActive: false,
        isAvailable: false,
        isRestricted: true,
        statusMessage: 'Module not found'
      };
    }

    return {
      isActive,
      isAvailable: moduleExists,
      isRestricted: !isActive,
      statusMessage: isActive ? 'Active' : 'Inactive - Contact admin to enable'
    };
  };

  // Check if user can access a specific module
  const canAccessModule = (moduleName: string) => {
    if (!profile) return false;
    
    // Core module is always accessible to authenticated users
    if (moduleName === 'neura-core') return true;
    
    // Check if module is active in workspace
    return isModuleActive(moduleName);
  };

  // Check if user can manage modules (root users only)
  const canManageModules = () => {
    return profile?.role === 'root';
  };

  // Check if user can access workspace settings
  const canManageWorkspace = () => {
    if (!profile) return false;
    return ['root', 'admin'].includes(profile.role);
  };

  // Get list of accessible modules for current user
  const getAccessibleModules = () => {
    const coreModules = ['neura-core'];
    return [...coreModules, ...activeModules];
  };

  // Get modules with their status information
  const getModulesWithStatus = () => {
    const modules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
    return modules.map(moduleName => ({
      name: moduleName,
      displayName: getModuleDisplayName(moduleName),
      ...getModuleStatus(moduleName)
    }));
  };

  // Get display name for a module
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

  // Check specific module access
  const canAccessNeuraFlow = () => canAccessModule('neura-flow');
  const canAccessNeuraCRM = () => canAccessModule('neura-crm');
  const canAccessNeuraForms = () => canAccessModule('neura-forms');
  const canAccessNeuraEdu = () => canAccessModule('neura-edu');

  return {
    canAccessModule,
    canManageModules,
    canManageWorkspace,
    getAccessibleModules,
    getModuleStatus,
    getModulesWithStatus,
    getModuleDisplayName,
    canAccessNeuraFlow,
    canAccessNeuraCRM,
    canAccessNeuraForms,
    canAccessNeuraEdu,
    activeModules,
  };
}
