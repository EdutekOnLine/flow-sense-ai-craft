
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { useRootPermissions } from './useRootPermissions';

export interface ModuleStatus {
  isActive: boolean;
  isAvailable: boolean;
  isRestricted: boolean;
  statusMessage?: string;
  hasDependencies?: boolean;
  missingDependencies?: string[];
  version?: string;
}

export function useModulePermissions() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();
  const { 
    isModuleActive, 
    activeModules, 
    allModules, 
    workspaceModules, 
    moduleAccessInfo,
    checkModuleDependencies 
  } = useWorkspace();

  // Root users can access ALL modules regardless of workspace activation
  const canAccessModule = (moduleName: string) => {
    if (!profile) return false;
    
    // Root users can access ALL modules regardless of workspace activation
    if (isRootUser) return true;
    
    // Core module is always accessible to authenticated users
    if (moduleName === 'neura-core') return true;
    
    // For regular users, check workspace activation
    return isModuleActive(moduleName);
  };

  // Module status check with root bypass
  const getModuleStatus = (moduleName: string): ModuleStatus => {
    if (!profile) {
      return {
        isActive: true,
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Loading...'
      };
    }

    // Root users see all modules as active and available
    if (isRootUser) {
      return {
        isActive: true,
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Root Access - All Modules Available',
        hasDependencies: true,
        missingDependencies: [],
        version: '1.0.0'
      };
    }

    // Core module is always available to authenticated users
    if (moduleName === 'neura-core') {
      return {
        isActive: true,
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Core Module',
        hasDependencies: true,
        missingDependencies: [],
        version: '1.0.0'
      };
    }

    // Use cached module info if available for detailed status
    if (moduleAccessInfo) {
      const accessInfo = moduleAccessInfo.find(m => m.module_name === moduleName);
      if (accessInfo) {
        return {
          isActive: accessInfo.is_active,
          isAvailable: accessInfo.is_available,
          isRestricted: !accessInfo.is_active,
          statusMessage: accessInfo.is_active ? 'Active' : 
            accessInfo.missing_dependencies.length > 0 ? 
            `Missing dependencies: ${accessInfo.missing_dependencies.join(', ')}` :
            'Inactive',
          hasDependencies: accessInfo.has_dependencies,
          missingDependencies: accessInfo.missing_dependencies,
          version: accessInfo.version
        };
      }
    }

    // Optimistic fallback
    const isActive = isModuleActive(moduleName);
    const moduleExists = allModules?.some(m => m.name === moduleName) || true;
    
    return {
      isActive: isActive || true,
      isAvailable: moduleExists,
      isRestricted: false,
      statusMessage: isActive ? 'Active' : 'Loading...'
    };
  };

  // Check if user can manage modules (root users can manage all)
  const canManageModules = () => {
    return isRootUser; // Only root users can manage modules
  };

  // Check if user can access workspace settings (root users can access all)
  const canManageWorkspace = () => {
    if (!profile) return false;
    return isRootUser || ['admin'].includes(profile.role);
  };

  // Get list of accessible modules - root users get all available modules
  const getAccessibleModules = () => {
    if (isRootUser) {
      // Root users get all available modules
      const allAvailableModules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
      return allAvailableModules;
    }
    
    const coreModules = ['neura-core'];
    return [...coreModules, ...activeModules];
  };

  // Get modules with their status information - optimistic loading
  const getModulesWithStatus = () => {
    if (isRootUser) {
      const allAvailableModules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
      return allAvailableModules.map(moduleName => ({
        name: moduleName,
        displayName: getModuleDisplayName(moduleName),
        isActive: true,
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Root Access - All Modules Available',
        hasDependencies: true,
        missingDependencies: [],
        version: '1.0.0',
        settings: {}
      }));
    }

    if (moduleAccessInfo && moduleAccessInfo.length > 0) {
      return moduleAccessInfo.map(accessInfo => ({
        name: accessInfo.module_name,
        displayName: accessInfo.display_name,
        isActive: accessInfo.is_active,
        isAvailable: accessInfo.is_available,
        isRestricted: !accessInfo.is_active,
        statusMessage: accessInfo.is_active ? 'Active' : 
          accessInfo.missing_dependencies.length > 0 ? 
          `Missing: ${accessInfo.missing_dependencies.join(', ')}` :
          'Inactive',
        hasDependencies: accessInfo.has_dependencies,
        missingDependencies: accessInfo.missing_dependencies,
        version: accessInfo.version,
        settings: accessInfo.settings
      }));
    }

    // Optimistic fallback
    const modules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
    return modules.map(moduleName => ({
      name: moduleName,
      displayName: getModuleDisplayName(moduleName),
      ...getModuleStatus(moduleName)
    }));
  };

  // Get display name for a module
  const getModuleDisplayName = (moduleName: string) => {
    if (moduleAccessInfo) {
      const accessInfo = moduleAccessInfo.find(m => m.module_name === moduleName);
      if (accessInfo) return accessInfo.display_name;
    }

    const displayNames: Record<string, string> = {
      'neura-core': 'NeuraCore',
      'neura-flow': 'NeuraFlow',
      'neura-crm': 'NeuraCRM',
      'neura-forms': 'NeuraForms',
      'neura-edu': 'NeuraEdu'
    };
    return displayNames[moduleName] || moduleName;
  };

  // Root users can activate any module in any workspace
  const canActivateModule = (moduleName: string) => {
    if (isRootUser) return true;
    
    if (moduleAccessInfo) {
      const accessInfo = moduleAccessInfo.find(m => m.module_name === moduleName);
      return accessInfo ? accessInfo.has_dependencies : true;
    }
    return true;
  };

  const getMissingDependencies = (moduleName: string): string[] => {
    if (isRootUser) return []; // Root users bypass dependency checks
    
    if (moduleAccessInfo) {
      const accessInfo = moduleAccessInfo.find(m => m.module_name === moduleName);
      return accessInfo ? accessInfo.missing_dependencies : [];
    }
    return [];
  };

  // Specific module access checks - root users can access all
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
    canActivateModule,
    getMissingDependencies,
    checkModuleDependencies,
    canAccessNeuraFlow,
    canAccessNeuraCRM,
    canAccessNeuraForms,
    canAccessNeuraEdu,
    activeModules,
    isLoading: false,
    isRootUser, // Expose root status
  };
}
