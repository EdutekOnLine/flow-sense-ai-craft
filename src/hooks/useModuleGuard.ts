
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function useModuleGuard(moduleName: string) {
  const { loading: authLoading } = useAuth();
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
      // Wait for auth to load before checking access
      if (authLoading) {
        return;
      }

      setIsChecking(true);
      
      try {
        const access = canAccessModule(moduleName);
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
        
        if (isOnline) {
          toast({
            title: 'Connection Error',
            description: 'Unable to verify module access. Please try again.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [moduleName, canAccessModule, toast, getModuleDisplayName, retryCount, isOnline, authLoading]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
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

  return {
    isLoading: authLoading || isChecking,
    hasAccess,
    moduleStatus,
    displayName,
    isOnline,
    canManageModules: canManageModules(),
    handleRetry
  };
}
