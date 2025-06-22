import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ModuleAccessInfo {
  module_name: string;
  display_name: string;
  is_active: boolean;
  is_available: boolean;
  has_dependencies: boolean;
  missing_dependencies: string[];
  version: string;
  settings: any;
}

interface CachedModuleData {
  data: ModuleAccessInfo[];
  timestamp: number;
  workspace_id: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'module_access_cache';

export function useOptimizedWorkspace() {
  const { profile, loading: authLoading } = useAuth();
  const [moduleAccessInfo, setModuleAccessInfo] = useState<ModuleAccessInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModules, setActiveModules] = useState<string[]>([]);

  // Get cached data if valid
  const getCachedData = (workspaceId: string): ModuleAccessInfo[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache: CachedModuleData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is valid (not expired and same workspace)
      if (
        parsedCache.workspace_id === workspaceId &&
        (now - parsedCache.timestamp) < CACHE_DURATION
      ) {
        console.log('Using cached module data for workspace:', workspaceId);
        return parsedCache.data;
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  // Cache data
  const setCachedData = (data: ModuleAccessInfo[], workspaceId: string) => {
    try {
      const cacheData: CachedModuleData = {
        data,
        timestamp: Date.now(),
        workspace_id: workspaceId
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Cached module data for workspace:', workspaceId);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  // Fetch module access info
  const fetchModuleAccessInfo = async (workspaceId: string, userId: string, useCache = true) => {
    console.log('fetchModuleAccessInfo called with:', { workspaceId, userId, useCache });
    
    // Try cache first if requested
    if (useCache) {
      const cachedData = getCachedData(workspaceId);
      if (cachedData) {
        setModuleAccessInfo(cachedData);
        setActiveModules(cachedData.filter(m => m.is_active).map(m => m.module_name));
        setLoading(false);
        
        // Fetch fresh data in background
        setTimeout(() => {
          fetchModuleAccessInfo(workspaceId, userId, false);
        }, 100);
        return;
      }
    }

    try {
      console.log('Fetching fresh module access info for workspace:', workspaceId);
      
      const { data, error } = await supabase.rpc('get_module_access_info', {
        p_workspace_id: workspaceId,
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching module access info:', error);
        // Provide fallback data for core module
        const fallbackData: ModuleAccessInfo[] = [{
          module_name: 'neura-core',
          display_name: 'NeuraCore',
          is_active: true,
          is_available: true,
          has_dependencies: false,
          missing_dependencies: [],
          version: '1.0.0',
          settings: {}
        }];
        setModuleAccessInfo(fallbackData);
        setActiveModules(['neura-core']);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Module access info received:', data);
        setModuleAccessInfo(data);
        setActiveModules(data.filter((m: ModuleAccessInfo) => m.is_active).map((m: ModuleAccessInfo) => m.module_name));
        
        // Cache the fresh data
        setCachedData(data, workspaceId);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchModuleAccessInfo:', error);
      // Provide fallback data in case of any error
      const fallbackData: ModuleAccessInfo[] = [{
        module_name: 'neura-core',
        display_name: 'NeuraCore',
        is_active: true,
        is_available: true,
        has_dependencies: false,
        missing_dependencies: [],
        version: '1.0.0',
        settings: {}
      }];
      setModuleAccessInfo(fallbackData);
      setActiveModules(['neura-core']);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useOptimizedWorkspace effect triggered:', { authLoading, profile });
    
    // Keep loading while auth is loading
    if (authLoading) {
      console.log('Auth still loading, keeping loading state true');
      setLoading(true);
      return;
    }

    // If auth is done but no profile, stop loading (user not authenticated)
    if (!profile) {
      console.log('No profile found, stopping loading');
      setLoading(false);
      setModuleAccessInfo(null);
      setActiveModules([]);
      return;
    }

    // If profile exists, fetch module data
    if (profile.workspace_id) {
      console.log('Profile found with workspace, fetching module data');
      fetchModuleAccessInfo(profile.workspace_id, profile.id);
    } else {
      // Root users or users without workspace get default access
      console.log('Profile found without workspace (likely root user)');
      const defaultData: ModuleAccessInfo[] = [{
        module_name: 'neura-core',
        display_name: 'NeuraCore',
        is_active: true,
        is_available: true,
        has_dependencies: false,
        missing_dependencies: [],
        version: '1.0.0',
        settings: {}
      }];
      setModuleAccessInfo(defaultData);
      setActiveModules(['neura-core']);
      setLoading(false);
    }
  }, [profile, authLoading]);

  // Helper functions
  const isModuleActive = (moduleName: string): boolean => {
    if (!profile) return false;
    
    // Root users can access all modules
    if (profile.role === 'root') return true;
    
    // Core module is always active
    if (moduleName === 'neura-core') return true;
    
    return activeModules.includes(moduleName);
  };

  const getModuleStatus = (moduleName: string) => {
    if (!moduleAccessInfo) return null;
    return moduleAccessInfo.find(m => m.module_name === moduleName) || null;
  };

  return {
    moduleAccessInfo,
    activeModules,
    loading,
    isModuleActive,
    getModuleStatus,
    refreshModuleData: () => {
      if (profile?.workspace_id) {
        fetchModuleAccessInfo(profile.workspace_id, profile.id, false);
      }
    }
  };
}
