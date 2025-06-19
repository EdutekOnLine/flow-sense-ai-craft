
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ModuleStatusNotifier() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile?.workspace_id) return;

    // Listen for real-time changes to workspace_modules
    const channel = supabase
      .channel('module-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_modules',
          filter: `workspace_id=eq.${profile.workspace_id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const oldRecord = payload.old as any;
            const newRecord = payload.new as any;
            
            // Only notify if activation status changed
            if (oldRecord?.is_active !== newRecord?.is_active) {
              const action = newRecord.is_active ? 'enabled' : 'disabled';
              
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['workspace-modules'] });
              queryClient.invalidateQueries({ queryKey: ['module-access-info'] });
              
              toast({
                title: 'Module Status Updated',
                description: `A module has been ${action} in your workspace.`,
                duration: 5000,
              });

              // Auto-refresh if the user is currently viewing a module that was deactivated
              if (!newRecord.is_active) {
                const currentPath = window.location.pathname;
                const currentHash = window.location.hash;
                
                if (shouldReloadForModule(currentPath, currentHash, newRecord.module_id)) {
                  toast({
                    title: 'Module Deactivated',
                    description: 'Redirecting to dashboard as the current module is no longer available.',
                    variant: 'destructive',
                    duration: 3000,
                  });
                  
                  setTimeout(() => {
                    window.location.hash = '';
                    window.location.reload();
                  }, 2000);
                }
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.workspace_id, toast, queryClient]);

  return null; // This component doesn't render anything
}

// Helper function to determine if page should reload based on module deactivation
function shouldReloadForModule(currentPath: string, currentHash: string, moduleId: string): boolean {
  // Map module IDs to their route patterns and hash fragments
  const moduleRoutes: Record<string, { paths: string[], hashes: string[] }> = {
    'neura-flow': { 
      paths: ['/workflows', '/workflow-builder'], 
      hashes: ['#workflow-builder', '#workflow-inbox', '#templates'] 
    },
    'neura-crm': { 
      paths: ['/crm', '/contacts'], 
      hashes: ['#crm'] 
    },
    'neura-forms': { 
      paths: ['/forms'], 
      hashes: ['#forms'] 
    },
    'neura-edu': { 
      paths: ['/education', '/courses'], 
      hashes: ['#education'] 
    }
  };

  const routes = moduleRoutes[moduleId];
  if (!routes) return false;

  const pathMatches = routes.paths.some(route => currentPath.startsWith(route));
  const hashMatches = routes.hashes.some(hash => currentHash === hash);
  
  return pathMatches || hashMatches;
}
