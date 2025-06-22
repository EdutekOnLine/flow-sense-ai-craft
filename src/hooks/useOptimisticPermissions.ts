
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface PermissionCache {
  userId: string;
  role: string;
  timestamp: number;
  permissions: {
    canAccessUsers: boolean;
    canAccessReports: boolean;
    canAccessSettings: boolean;
    canManageModules: boolean;
    canManageWorkspace: boolean;
  };
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'neura_permissions_cache';

export function useOptimisticPermissions() {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState({
    canAccessUsers: false,
    canAccessReports: true, // Always accessible
    canAccessSettings: true, // Always accessible
    canManageModules: false,
    canManageWorkspace: false,
  });
  const [isLoading, setIsLoading] = useState(false); // Start as false for optimistic loading

  useEffect(() => {
    // If no profile, use optimistic defaults
    if (!profile) {
      setIsLoading(false);
      return;
    }

    // Check localStorage cache first for instant loading
    const checkCache = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: PermissionCache = JSON.parse(cached);
          const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
          
          if (!isExpired && parsedCache.userId === profile.id && parsedCache.role === profile.role) {
            setPermissions(parsedCache.permissions);
            return true;
          }
        }
      } catch (error) {
        console.warn('Failed to read permissions cache:', error);
      }
      return false;
    };

    // Try cache first for instant loading
    const hasCachedData = checkCache();
    
    // Calculate optimistic permissions based on role immediately
    const calculateOptimisticPermissions = () => {
      const isRoot = profile.role === 'root';
      const isAdmin = profile.role === 'admin';

      const newPermissions = {
        canAccessUsers: isRoot || isAdmin,
        canAccessReports: true, // Always accessible
        canAccessSettings: true, // Always accessible
        canManageModules: isRoot,
        canManageWorkspace: isRoot || isAdmin,
      };

      setPermissions(newPermissions);
      setIsLoading(false);

      // Cache the results for next time
      try {
        const cacheData: PermissionCache = {
          userId: profile.id,
          role: profile.role,
          timestamp: Date.now(),
          permissions: newPermissions,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to cache permissions:', error);
      }
    };

    // If no cached data, calculate immediately for optimistic loading
    if (!hasCachedData) {
      calculateOptimisticPermissions();
    }
  }, [profile]);

  // Clear cache when user changes
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear permissions cache:', error);
    }
  };

  return {
    ...permissions,
    isLoading,
    clearCache,
  };
}
