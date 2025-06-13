import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserPresence {
  id: string;
  user_id: string;
  is_online: boolean;
  last_seen: string;
  session_id?: string;
  updated_at: string;
}

interface UserPresenceWithProfile extends UserPresence {
  profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
    role: string;
  };
}

export function useUserPresence() {
  const { user, profile } = useAuth();
  const [allUserPresence, setAllUserPresence] = useState<UserPresenceWithProfile[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const isRootUser = profile?.role === 'root';

  // Update user's own presence status
  const updatePresence = async (online: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: online,
          last_seen: new Date().toISOString(),
          session_id: sessionIdRef.current,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating presence:', error);
      } else {
        console.log('Presence updated successfully:', { online, userId: user.id });
        setIsOnline(online);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Fetch all user presence data (only for root users)
  const fetchAllUserPresence = async () => {
    if (!isRootUser) {
      console.log('Not a root user, skipping presence fetch');
      return;
    }

    try {
      console.log('Fetching user presence data...');
      
      // First, get all user presence records
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (presenceError) {
        console.error('Error fetching user presence:', presenceError);
        return;
      }

      console.log('Raw presence data:', presenceData);

      if (!presenceData || presenceData.length === 0) {
        console.log('No presence data found');
        setAllUserPresence([]);
        return;
      }

      // Then get profiles for these users
      const userIds = presenceData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Still show presence data without profile info
        setAllUserPresence(presenceData.map(p => ({ ...p, profile: undefined })));
        return;
      }

      console.log('Profiles data:', profilesData);

      // Combine presence data with profile data
      const combined = presenceData.map(presence => {
        const profile = profilesData?.find(p => p.id === presence.user_id);
        return {
          ...presence,
          profile: profile ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            role: profile.role
          } : undefined
        };
      });

      console.log('Combined presence data:', combined);
      setAllUserPresence(combined);
    } catch (error) {
      console.error('Error fetching user presence:', error);
    }
  };

  // Set up real-time subscription for presence updates (root users only)
  useEffect(() => {
    if (!isRootUser) return;

    console.log('Setting up real-time subscription for presence updates');

    const channel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('Presence change detected:', payload);
          fetchAllUserPresence();
        }
      )
      .subscribe();

    // Initial fetch
    fetchAllUserPresence();

    return () => {
      console.log('Cleaning up presence subscription');
      supabase.removeChannel(channel);
    };
  }, [isRootUser]);

  // Set up presence tracking for current user
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up presence tracking for user:', user.id);

    // Go online when component mounts
    updatePresence(true);

    // Set up heartbeat to keep presence alive
    heartbeatIntervalRef.current = setInterval(() => {
      if (isOnline) {
        updatePresence(true);
      }
    }, 30000); // Update every 30 seconds

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    // Handle online/offline status
    const handleOnline = () => updatePresence(true);
    const handleOffline = () => updatePresence(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Mark as offline when component unmounts
      updatePresence(false);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, isOnline]);

  return {
    allUserPresence,
    isOnline,
    updatePresence,
    isRootUser,
  };
}
