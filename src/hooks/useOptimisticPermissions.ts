
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

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'neura_permissions_cache';

export function useOptimisticPermissions() {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState({
    canAccessUsers: false,
    canAccessReports: true, // Reports are generally accessible
    canAccessSettings: true, // Settings are generally accessible
    canManageModules: false,
    canManageWorkspace: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setIsLoading(true);
      return;
    }

    // Check cache first
    const checkCache = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: PermissionCache = JSON.parse(cached);
          const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
          
          if (!isExpired && parsedCache.userId === profile.id && parsedCache.role === profile.role) {
            setPermissions(parsedCache.permissions);
            setIsLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.warn('Failed to read permissions cache:', error);
      }
      return false;
    };

    // Try to use cache first
    if (checkCache()) {
      return;
    }

    // Calculate permissions based on role (optimistic approach)
    const calculatePermissions = () => {
      const isRoot = profile.role === 'root';
      const isAdmin = profile.role === 'admin';
      const isManager = profile.role === 'manager';

      const newPermissions = {
        canAccessUsers: isRoot || isAdmin,
        canAccessReports: true, // All users can access reports
        canAccessSettings: true, // All users can access settings
        canManageModules: isRoot,
        canManageWorkspace: isRoot || isAdmin,
      };

      setPermissions(newPermissions);
      setIsLoading(false);

      // Cache the results
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

    calculatePermissions();
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
