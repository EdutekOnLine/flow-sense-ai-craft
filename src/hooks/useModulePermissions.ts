
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { useSmartModuleCache } from './useSmartCache';

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
  const { 
    isModuleActive, 
    activeModules, 
    allModules, 
    workspaceModules, 
    moduleAccessInfo,
    checkModuleDependencies 
  } = useWorkspace();

  // Use smart caching for better performance
  const { data: cachedModuleInfo, isLoading: cacheLoading } = useSmartModuleCache(
    profile?.workspace_id,
    profile?.id
  );

  // Prefer cached data when available, fallback to workspace data
  const effectiveModuleInfo = cachedModuleInfo?.length ? cachedModuleInfo : moduleAccessInfo;

  // Check if user can access a specific module
  const canAccessModule = (moduleName: string) => {
    if (!profile) return false;
    
    // Root users can access ALL modules regardless of workspace activation
    if (profile.role === 'root') return true;
    
    // Core module is always accessible to authenticated users
    if (moduleName === 'neura-core') return true;
    
    // Show loading state as accessible to prevent UI flashing
    if (cacheLoading && !effectiveModuleInfo) return true;
    
    // Check if module is active in workspace for non-root users
    return isModuleActive(moduleName);
  };

  // Get detailed module status using cached data when possible
  const getModuleStatus = (moduleName: string): ModuleStatus => {
    if (!profile) {
      return {
        isActive: false,
        isAvailable: false,
        isRestricted: true,
        statusMessage: 'Loading permissions...'
      };
    }

    // Root users see all modules as active and available
    if (profile.role === 'root') {
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

    // Use cached module info if available
    if (effectiveModuleInfo) {
      const accessInfo = effectiveModuleInfo.find(m => m.module_name === moduleName);
      if (accessInfo) {
        return {
          isActive: accessInfo.is_active,
          isAvailable: accessInfo.is_available,
          isRestricted: !accessInfo.is_active,
          statusMessage: accessInfo.is_active ? 'Active' : 
            accessInfo.missing_dependencies.length > 0 ? 
            `Missing dependencies: ${accessInfo.missing_dependencies.join(', ')}` :
            'Inactive - Contact admin to enable',
          hasDependencies: accessInfo.has_dependencies,
          missingDependencies: accessInfo.missing_dependencies,
          version: accessInfo.version
        };
      }
    }

    // Show loading state instead of restricting access
    if (cacheLoading) {
      return {
        isActive: true, // Assume active during loading to prevent UI flashing
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Checking permissions...'
      };
    }

    // Fallback to basic check
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
    if (profile?.role === 'root') {
      // Root users get all available modules
      const allAvailableModules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
      return allAvailableModules;
    }
    
    const coreModules = ['neura-core'];
    return [...coreModules, ...activeModules];
  };

  // Get modules with their status information (enhanced with cached data)
  const getModulesWithStatus = () => {
    if (profile?.role === 'root') {
      // Root users see all modules as available
      const allAvailableModules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
      return allAvailableModules.map(moduleName => ({
        name: moduleName,
        displayName: getModuleDisplayName(moduleName),
        isActive: true,
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Root Access',
        hasDependencies: true,
        missingDependencies: [],
        version: '1.0.0',
        settings: {}
      }));
    }

    if (effectiveModuleInfo && effectiveModuleInfo.length > 0) {
      return effectiveModuleInfo.map(accessInfo => ({
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

    // Fallback to basic module list
    const modules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
    return modules.map(moduleName => ({
      name: moduleName,
      displayName: getModuleDisplayName(moduleName),
      ...getModuleStatus(moduleName)
    }));
  };

  // Get display name for a module
  const getModuleDisplayName = (moduleName: string) => {
    if (effectiveModuleInfo) {
      const accessInfo = effectiveModuleInfo.find(m => m.module_name === moduleName);
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

  // Check if module can be activated (dependencies satisfied)
  const canActivateModule = (moduleName: string) => {
    if (profile?.role === 'root') return true;
    
    if (effectiveModuleInfo) {
      const accessInfo = effectiveModuleInfo.find(m => m.module_name === moduleName);
      return accessInfo ? accessInfo.has_dependencies : false;
    }
    return true; // Fallback to allowing activation
  };

  // Get missing dependencies for a module
  const getMissingDependencies = (moduleName: string): string[] => {
    if (profile?.role === 'root') return []; // Root users don't have missing dependencies
    
    if (effectiveModuleInfo) {
      const accessInfo = effectiveModuleInfo.find(m => m.module_name === moduleName);
      return accessInfo ? accessInfo.missing_dependencies : [];
    }
    return [];
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
    canActivateModule,
    getMissingDependencies,
    checkModuleDependencies,
    canAccessNeuraFlow,
    canAccessNeuraCRM,
    canAccessNeuraForms,
    canAccessNeuraEdu,
    activeModules,
    isLoading: cacheLoading && !effectiveModuleInfo?.length,
  };
}
