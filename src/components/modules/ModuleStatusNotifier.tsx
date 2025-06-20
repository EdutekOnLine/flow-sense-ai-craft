
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ModuleStatusNotifier() {
  const { profile } = useAuth();
  const { toast } = useToast();

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
              
              // Get module name (we'd need to fetch this from modules table)
              toast({
                title: 'Module Status Updated',
                description: `A module has been ${action} in your workspace.`,
              });

              // Reload the page if the user is currently viewing a module that was deactivated
              if (!newRecord.is_active) {
                const currentPath = window.location.pathname;
                // Check if current path corresponds to the deactivated module
                // This would need module-to-path mapping logic
                if (shouldReloadForModule(currentPath, newRecord.module_id)) {
                  setTimeout(() => {
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
  }, [profile?.workspace_id, toast]);

  return null; // This component doesn't render anything
}

// Helper function to determine if page should reload based on module deactivation
function shouldReloadForModule(currentPath: string, moduleId: string): boolean {
  // Map module IDs to their route patterns
  const moduleRoutes: Record<string, string[]> = {
    'neura-flow': ['/workflows', '/workflow-builder'],
    'neura-crm': ['/crm', '/contacts'],
    'neura-forms': ['/forms'],
    'neura-edu': ['/education', '/courses']
  };

  const routes = moduleRoutes[moduleId] || [];
  return routes.some(route => currentPath.startsWith(route));
}
