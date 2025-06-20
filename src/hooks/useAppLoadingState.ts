
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

export function useAppLoadingState() {
  const { loading: authLoading, profile } = useAuth();
  const { 
    workspaceLoading, 
    modulesLoading, 
    workspaceModulesLoading, 
    moduleAccessLoading 
  } = useWorkspace();

  // Core auth must be loaded
  const isAuthReady = !authLoading;
  
  // For root users, we don't need to wait for workspace data
  const isRootUser = profile?.role === 'root';
  
  // Calculate if we have minimum required data
  const hasMinimumData = isAuthReady && (isRootUser || profile !== null);
  
  // Calculate if we're still loading critical data
  const isCriticalLoading = authLoading || (!isRootUser && workspaceLoading);
  
  // Calculate if we're loading optional data
  const isOptionalLoading = modulesLoading || workspaceModulesLoading || moduleAccessLoading;

  return {
    // Critical loading that blocks the UI
    isCriticalLoading,
    // Optional loading that doesn't block the UI
    isOptionalLoading,
    // Whether we have minimum data to render
    hasMinimumData,
    // Individual loading states for debugging
    authLoading,
    workspaceLoading,
    modulesLoading,
    workspaceModulesLoading,
    moduleAccessLoading,
    // User info
    isRootUser,
    profile
  };
}
