
import { useEffect, useState, useCallback, useRef } from 'react';
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

export function useOptimizedUserPresence() {
  const { profile } = useAuth();
  const [allUserPresence, setAllUserPresence] = useState<UserPresenceWithProfile[]>([]);
  const isRootUser = profile?.role === 'root';
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Memoized fetch function to prevent unnecessary recreations
  const fetchAllUserPresence = useCallback(async () => {
    if (!isRootUser || !isMountedRef.current) {
      return;
    }

    try {
      // First, get all user presence records
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (presenceError || !isMountedRef.current) {
        console.error('Error fetching user presence:', presenceError);
        return;
      }

      if (!presenceData || presenceData.length === 0) {
        setAllUserPresence([]);
        return;
      }

      // Then get profiles for these users
      const userIds = presenceData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .in('id', userIds);

      if (profilesError || !isMountedRef.current) {
        console.error('Error fetching profiles:', profilesError);
        setAllUserPresence(presenceData.map(p => ({ ...p, profile: undefined })));
        return;
      }

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

      if (isMountedRef.current) {
        setAllUserPresence(combined);
      }
    } catch (error) {
      console.error('Error fetching user presence:', error);
    }
  }, [isRootUser]);

  // Set up real-time subscription with proper cleanup
  useEffect(() => {
    if (!isRootUser) return;

    // Clean up existing channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

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
          if (isMountedRef.current) {
            fetchAllUserPresence();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Initial fetch
    fetchAllUserPresence();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isRootUser, fetchAllUserPresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    allUserPresence,
    isRootUser,
  };
}
