
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useModuleGuard(moduleName: string) {
  const { loading: authLoading, profile, authError } = useAuth();
  const { 
    canAccessModule, 
    getModuleStatus, 
    getModuleDisplayName,
    canManageModules 
  } = useModulePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Timeout fallback to prevent infinite checking
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn(`Module guard timeout for ${moduleName}, forcing check to complete`);
      setIsChecking(false);
    }, 8000); // Increased timeout to allow for profile loading

    return () => clearTimeout(timeout);
  }, [moduleName]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      console.log(`Checking access for module: ${moduleName}`, {
        authLoading,
        profile: profile ? { id: profile.id, role: profile.role } : null,
        authError
      });

      // If auth is still loading, wait
      if (authLoading) {
        console.log('Auth still loading, waiting...');
        return;
      }

      // If auth failed, allow access to core module for fallback
      if (authError && moduleName === 'neura-core') {
        console.log('Auth error detected, allowing core module access');
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // If auth failed for non-core modules, deny access
      if (authError && moduleName !== 'neura-core') {
        console.log('Auth error detected, denying access to non-core module');
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      // If no profile after auth loading is complete, check for core module
      if (!profile) {
        if (moduleName === 'neura-core') {
          console.log('No profile but allowing core module access');
          setHasAccess(true);
        } else {
          console.log('No profile, denying access to non-core module');
          setHasAccess(false);
        }
        setIsChecking(false);
        return;
      }

      // Root users get access to everything immediately
      if (profile.role === 'root' as any) {
        console.log('Root user detected, granting access to all modules');
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // For non-root users, check module permissions
      try {
        const access = canAccessModule(moduleName);
        console.log(`Module access check result for ${moduleName}:`, access);
        setHasAccess(access);
        
        // Show toast notification for access denial (only on first check)
        if (!access && moduleName !== 'neura-core' && retryCount === 0) {
          toast({
            title: 'Access Restricted',
            description: `${getModuleDisplayName(moduleName)} is not available in your workspace.`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking module access:', error);
        
        // Fallback: allow core module access on error
        if (moduleName === 'neura-core') {
          console.log('Error checking access, allowing core module');
          setHasAccess(true);
        } else if (profile.role === 'root' as any) {
          console.log('Error checking access, but root user gets access');
          setHasAccess(true);
        } else {
          setHasAccess(false);
          
          if (isOnline && retryCount === 0) {
            toast({
              title: 'Connection Error',
              description: 'Unable to verify module access. Please try again.',
              variant: 'destructive',
            });
          }
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [moduleName, canAccessModule, toast, getModuleDisplayName, retryCount, isOnline, authLoading, profile, authError]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setIsChecking(true);
    
    // Invalidate queries to refresh data
    await queryClient.invalidateQueries({ queryKey: ['workspace-modules'] });
    await queryClient.invalidateQueries({ queryKey: ['module-access-info'] });
    
    toast({
      title: 'Refreshing...',
      description: 'Checking module access again.',
    });
  };

  const moduleStatus = getModuleStatus(moduleName);
  const displayName = getModuleDisplayName(moduleName);

  // Only show loading if auth is loading OR we're still checking (but not indefinitely)
  const isLoading = authLoading || (isChecking && retryCount < 3);

  return {
    isLoading,
    hasAccess,
    moduleStatus,
    displayName,
    isOnline,
    canManageModules: canManageModules(),
    handleRetry
  };
}
