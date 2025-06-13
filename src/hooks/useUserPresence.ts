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
        });

      if (error) {
        console.error('Error updating presence:', error);
      } else {
        setIsOnline(online);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Fetch all user presence data (only for root users)
  const fetchAllUserPresence = async () => {
    if (!isRootUser) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select(`
          *,
          profiles!user_presence_user_id_fkey (
            first_name,
            last_name,
            email,
            role
          )
        `)
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching user presence:', error);
        return;
      }

      const presenceWithProfiles = data?.map(item => ({
        ...item,
        profile: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })) || [];

      setAllUserPresence(presenceWithProfiles);
    } catch (error) {
      console.error('Error fetching user presence:', error);
    }
  };

  // Set up real-time subscription for presence updates (root users only)
  useEffect(() => {
    if (!isRootUser) return;

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
          console.log('Presence change:', payload);
          fetchAllUserPresence();
        }
      )
      .subscribe();

    // Initial fetch
    fetchAllUserPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRootUser]);

  // Set up presence tracking for current user
  useEffect(() => {
    if (!user?.id) return;

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
