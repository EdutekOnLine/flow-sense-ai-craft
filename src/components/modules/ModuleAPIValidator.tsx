
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface ModuleAPIValidatorProps {
  moduleName: string;
  action?: 'read' | 'write' | 'delete';
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleAPIValidator({ 
  moduleName, 
  action = 'read', 
  children, 
  fallback 
}: ModuleAPIValidatorProps) {
  const { profile } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      if (!profile?.id) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('verify_api_access', {
          p_user_id: profile.id,
          p_module_name: moduleName,
          p_action: action
        });

        if (error) {
          console.error('API access validation error:', error);
          setHasAccess(false);
        } else {
          setHasAccess(data || false);
        }
      } catch (error) {
        console.error('Failed to validate API access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [profile?.id, moduleName, action]);

  if (loading) {
    return <div className="animate-pulse h-4 bg-muted rounded" />;
  }

  if (!hasAccess) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          You don't have the required permissions ({action}) for the {moduleName} module.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

