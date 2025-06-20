
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

export function useAppLoadingState() {
  const { loading: authLoading, profile, authError } = useAuth();
  const { 
    workspaceLoading, 
    modulesLoading, 
    workspaceModulesLoading, 
    moduleAccessLoading 
  } = useWorkspace();

  // Core auth must be loaded and either we have a profile OR there's an auth error
  const isAuthReady = !authLoading && (profile !== null || authError !== null);
  
  // For root users, we don't need to wait for workspace data
  const isRootUser = profile?.role === 'root';
  
  // Calculate if we have minimum required data
  const hasMinimumData = isAuthReady && (isRootUser || profile !== null || authError !== null);
  
  // Calculate if we're still loading critical data
  const isCriticalLoading = authLoading && !authError;
  
  // Calculate if we're loading optional data (only relevant for non-root users)
  const isOptionalLoading = !isRootUser && (modulesLoading || workspaceModulesLoading || moduleAccessLoading);

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
    profile,
    // Auth error state
    authError
  };
}
