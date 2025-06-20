
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: Database['public']['Enums']['user_role'];
  department?: string;
  avatar_url?: string;
  workspace_id?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Fetch user profile with error handling and timeout
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setAuthError('Failed to load user profile');
        return null;
      }
      
      console.log('Profile fetched successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setAuthError('Failed to load user profile');
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener - handle both user and profile loading
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Update session and user synchronously
        setSession(session);
        setUser(session?.user ?? null);
        setAuthError(null);
        
        if (session?.user) {
          // Don't set loading to false until we have profile data
          console.log('User detected, fetching profile...');
          try {
            const profileData = await fetchUserProfile(session.user.id);
            setProfile(profileData);
            console.log('Profile loaded, setting loading to false');
            setLoading(false);
          } catch (error) {
            console.error('Error fetching profile in auth state change:', error);
            setProfile(null);
            setLoading(false);
          }
        } else {
          // No user, clear profile and stop loading
          console.log('No user, clearing profile and stopping loading');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setAuthError('Failed to check authentication status');
        setLoading(false);
        return;
      }
      
      console.log('Existing session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Existing user found, fetching profile...');
        try {
          const profileData = await fetchUserProfile(session.user.id);
          setProfile(profileData);
          console.log('Profile loaded from existing session, setting loading to false');
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile from existing session:', error);
          setProfile(null);
          setLoading(false);
        }
      } else {
        console.log('No existing user, setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  // Presence tracking for all users
  useEffect(() => {
    if (!user?.id) return;

    const sessionId = crypto.randomUUID();

    // Update user's presence status
    const updatePresence = async (online: boolean) => {
      try {
        const { error } = await supabase
          .from('user_presence')
          .upsert({
            user_id: user.id,
            is_online: online,
            last_seen: new Date().toISOString(),
            session_id: sessionId,
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Error updating presence:', error);
        } else {
          console.log('Presence updated successfully:', { online, userId: user.id, role: profile?.role });
        }
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    console.log('Setting up presence tracking for user:', user.id, 'role:', profile?.role);

    // Go online when component mounts
    updatePresence(true);

    // Set up heartbeat to keep presence alive
    const heartbeatInterval = setInterval(() => {
      updatePresence(true);
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
      clearInterval(heartbeatInterval);
      
      // Mark as offline when component unmounts
      updatePresence(false);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, profile?.role]);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, bypassEmailConfirmation?: boolean) => {
    console.log('SignUp called with bypass:', bypassEmailConfirmation);
    setAuthError(null);
    setLoading(true);
    
    const signUpOptions: any = {
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    };

    // For invitation-based signups, we don't set emailRedirectTo at all
    // This prevents Supabase from trying to send confirmation emails
    if (!bypassEmailConfirmation) {
      signUpOptions.options.emailRedirectTo = `${window.location.origin}/`;
    }

    console.log('Signup options:', signUpOptions);

    const { data, error } = await supabase.auth.signUp(signUpOptions);
    
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
    
    console.log('Signup result:', { data, error });
    
    return { data, error };
  };

  const signOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
  };
}
