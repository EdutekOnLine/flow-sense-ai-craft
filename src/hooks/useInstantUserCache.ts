
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserCache {
  userId: string;
  role: string;
  workspaceId: string;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour for user data
const CACHE_KEY = 'neura_user_cache';

export function useInstantUserCache() {
  const { profile } = useAuth();
  const [cachedUserData, setCachedUserData] = useState<UserCache | null>(null);
  const [isInstantLoading, setIsInstantLoading] = useState(true);

  useEffect(() => {
    // Phase 3: Check localStorage cache first for instant access
    const checkCache = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: UserCache = JSON.parse(cached);
          const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
          
          if (!isExpired) {
            setCachedUserData(parsedCache);
            setIsInstantLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.warn('Failed to read user cache:', error);
      }
      return false;
    };

    // Try cache first for instant loading
    const hasCachedData = checkCache();
    
    // If we have profile data, update cache
    if (profile) {
      const newCache: UserCache = {
        userId: profile.id,
        role: profile.role,
        workspaceId: profile.workspace_id || '',
        timestamp: Date.now(),
      };

      setCachedUserData(newCache);
      setIsInstantLoading(false);

      // Update localStorage cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      } catch (error) {
        console.warn('Failed to cache user data:', error);
      }
    } else if (!hasCachedData) {
      setIsInstantLoading(false);
    }
  }, [profile]);

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      setCachedUserData(null);
    } catch (error) {
      console.warn('Failed to clear user cache:', error);
    }
  };

  // Return cached data if available, otherwise current profile
  const effectiveUserData = profile || (cachedUserData ? {
    id: cachedUserData.userId,
    role: cachedUserData.role as any,
    workspace_id: cachedUserData.workspaceId,
  } : null);

  return {
    userData: effectiveUserData,
    isInstantLoading,
    clearCache,
    hasCachedData: !!cachedUserData,
  };
}
