
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

export function useAppLoadingState() {
  const { loading: authLoading, profile, authError, user } = useAuth();
  const { 
    workspaceLoading, 
    modulesLoading, 
    workspaceModulesLoading, 
    moduleAccessLoading 
  } = useWorkspace();

  // Core auth must be loaded and either we have a user OR there's an auth error
  const isAuthReady = !authLoading && (user !== null || authError !== null);
  
  // For root users, we don't need to wait for workspace data
  const isRootUser = profile?.role === 'root' as any;
  
  // Calculate if we have minimum required data
  // We need auth to be ready, and if we have a user, we should eventually have a profile
  const hasMinimumData = isAuthReady && (authError !== null || user === null || profile !== null);
  
  // Calculate if we're still loading critical data
  // IMPORTANT: Only consider it critical loading if auth is actually loading AND there's no error
  const isCriticalLoading = authLoading && !authError;
  
  // Calculate if we're loading optional data (only relevant for non-root users with profiles)
  const isOptionalLoading = !isRootUser && !authError && profile && (modulesLoading || workspaceModulesLoading || moduleAccessLoading);

  console.log('AppLoadingState detailed:', {
    // Auth states
    authLoading,
    isAuthReady,
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    authError: !!authError,
    // Computed states
    isRootUser,
    hasMinimumData,
    isCriticalLoading,
    isOptionalLoading,
    // Workspace states (for debugging)
    workspaceLoading,
    modulesLoading,
    workspaceModulesLoading,
    moduleAccessLoading
  });

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
