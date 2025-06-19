
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SessionState {
  isSessionValid: boolean;
  lastActivity: Date;
  sessionWarning: boolean;
}

export function useSessionManagement() {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<SessionState>({
    isSessionValid: true,
    lastActivity: new Date(),
    sessionWarning: false,
  });

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const WARNING_TIMEOUT = 25 * 60 * 1000; // Warn at 25 minutes

  useEffect(() => {
    if (!profile) return;

    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;

    const resetActivity = () => {
      setSessionState(prev => ({
        ...prev,
        lastActivity: new Date(),
        sessionWarning: false,
      }));

      // Clear existing timeouts
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);

      // Set warning timeout
      warningTimeoutId = setTimeout(() => {
        setSessionState(prev => ({ ...prev, sessionWarning: true }));
        
        toast({
          title: 'Session Expiring Soon',
          description: 'Your session will expire in 5 minutes due to inactivity.',
          duration: 10000,
        });
      }, WARNING_TIMEOUT);

      // Set session timeout
      timeoutId = setTimeout(async () => {
        setSessionState(prev => ({ ...prev, isSessionValid: false }));
        
        toast({
          title: 'Session Expired',
          description: 'You have been signed out due to inactivity.',
          variant: 'destructive',
          duration: 5000,
        });

        await signOut();
      }, SESSION_TIMEOUT);
    };

    // Track user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activities.forEach(activity => {
      document.addEventListener(activity, resetActivity, { passive: true });
    });

    // Initialize activity tracking
    resetActivity();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setSessionState(prev => ({ ...prev, isSessionValid: false }));
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSessionState({
          isSessionValid: true,
          lastActivity: new Date(),
          sessionWarning: false,
        });
      }
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
      
      activities.forEach(activity => {
        document.removeEventListener(activity, resetActivity);
      });
      
      subscription.unsubscribe();
    };
  }, [profile, signOut, toast]);

  const extendSession = () => {
    if (profile) {
      setSessionState(prev => ({
        ...prev,
        lastActivity: new Date(),
        sessionWarning: false,
      }));
      
      toast({
        title: 'Session Extended',
        description: 'Your session has been extended.',
      });
    }
  };

  return {
    ...sessionState,
    extendSession,
  };
}
