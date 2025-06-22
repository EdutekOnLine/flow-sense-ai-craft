
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';

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

  // Use workspace data directly, no additional smart cache call to eliminate duplication
  const effectiveModuleInfo = moduleAccessInfo;

  // Optimistic module access check - assume access until proven otherwise
  const canAccessModule = (moduleName: string) => {
    if (!profile) return false;
    
    // Root users can access ALL modules regardless of workspace activation
    if (profile.role === 'root') return true;
    
    // Core module is always accessible to authenticated users
    if (moduleName === 'neura-core') return true;
    
    // For regular users, use optimistic approach - check workspace activation
    return isModuleActive(moduleName);
  };

  // Lightweight module status check - optimistic approach
  const getModuleStatus = (moduleName: string): ModuleStatus => {
    if (!profile) {
      return {
        isActive: true, // Optimistic default
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Loading...'
      };
    }

    // Root users see all modules as active and available
    if (profile.role === 'root') {
      return {
        isActive: true,
        isAvailable: true,
        isRestricted: false,
        statusMessage: 'Root Access',
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
            'Inactive',
          hasDependencies: accessInfo.has_dependencies,
          missingDependencies: accessInfo.missing_dependencies,
          version: accessInfo.version
        };
      }
    }

    // Optimistic fallback - assume active for better UX
    const isActive = isModuleActive(moduleName);
    const moduleExists = allModules?.some(m => m.name === moduleName) || true; // Optimistic
    
    return {
      isActive: isActive || true, // Optimistic default
      isAvailable: moduleExists,
      isRestricted: false, // Optimistic - don't restrict by default
      statusMessage: isActive ? 'Active' : 'Loading...'
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

  // Get list of accessible modules for current user - optimistic approach
  const getAccessibleModules = () => {
    if (profile?.role === 'root') {
      // Root users get all available modules
      const allAvailableModules = ['neura-core', 'neura-flow', 'neura-crm', 'neura-forms', 'neura-edu'];
      return allAvailableModules;
    }
    
    const coreModules = ['neura-core'];
    return [...coreModules, ...activeModules];
  };

  // Get modules with their status information - optimistic loading
  const getModulesWithStatus = () => {
    if (profile?.role === 'root') {
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

  // Optimistic checks
  const canActivateModule = (moduleName: string) => {
    if (profile?.role === 'root') return true;
    
    if (effectiveModuleInfo) {
      const accessInfo = effectiveModuleInfo.find(m => m.module_name === moduleName);
      return accessInfo ? accessInfo.has_dependencies : true; // Optimistic default
    }
    return true;
  };

  const getMissingDependencies = (moduleName: string): string[] => {
    if (profile?.role === 'root') return [];
    
    if (effectiveModuleInfo) {
      const accessInfo = effectiveModuleInfo.find(m => m.module_name === moduleName);
      return accessInfo ? accessInfo.missing_dependencies : [];
    }
    return [];
  };

  // Specific module access checks - optimistic
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
    isLoading: false, // Always false for optimistic loading
  };
}
