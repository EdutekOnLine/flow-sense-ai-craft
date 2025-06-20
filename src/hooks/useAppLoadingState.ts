
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

  console.log('useAppLoadingState called:', {
    authLoading,
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    authError: !!authError,
    workspaceLoading,
    modulesLoading,
    workspaceModulesLoading,
    moduleAccessLoading
  });

  // Core auth must be loaded first
  const isAuthReady = !authLoading && (user !== null || authError !== null);
  
  // Root users bypass most loading requirements
  const isRootUser = profile?.role === 'root';
  
  // For auth error or no user, we have minimum data to show error/login
  const hasAuthData = isAuthReady && (authError !== null || user !== null);
  
  // For users with profiles, we have minimum data to proceed
  const hasUserData = hasAuthData && (user === null || profile !== null);
  
  // Critical loading only when auth is actually loading
  const isCriticalLoading = authLoading && !authError;
  
  // For root users: only wait for auth + profile, skip workspace queries
  // For other users: wait for basic workspace data but don't block on everything
  const isOptionalLoading = !isRootUser && hasUserData && profile && !authError && (
    workspaceLoading || 
    modulesLoading
    // Removed workspaceModulesLoading and moduleAccessLoading from blocking
  );

  // Determine if we have minimum data to render the app
  let hasMinimumData = false;
  
  if (authError) {
    // Auth error means we can show error UI
    hasMinimumData = true;
  } else if (!user) {
    // No user means we can show login UI
    hasMinimumData = true;
  } else if (user && !profile) {
    // User exists but no profile yet - this might be loading or an error
    // Only block if auth is still actively loading
    hasMinimumData = !authLoading;
  } else if (user && profile) {
    // We have both user and profile
    if (isRootUser) {
      // Root users can proceed immediately
      hasMinimumData = true;
    } else {
      // Regular users need basic modules data but not everything
      hasMinimumData = !modulesLoading;
    }
  }

  console.log('AppLoadingState computed:', {
    isAuthReady,
    hasAuthData,
    hasUserData,
    isRootUser,
    hasMinimumData,
    isCriticalLoading,
    isOptionalLoading,
    decision: {
      showLoading: isCriticalLoading,
      showApp: hasMinimumData && !isCriticalLoading,
      authError: !!authError
    }
  });

  return {
    // Critical loading that blocks the UI completely
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
