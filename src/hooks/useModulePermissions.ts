
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';

export function useModulePermissions() {
  const { profile } = useAuth();
  const { isModuleActive, activeModules } = useWorkspace();

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
    canAccessNeuraFlow,
    canAccessNeuraCRM,
    canAccessNeuraForms,
    canAccessNeuraEdu,
    activeModules,
  };
}
