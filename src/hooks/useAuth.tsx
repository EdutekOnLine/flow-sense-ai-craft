
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  avatar_url?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('=== USE AUTH HOOK DEBUG ===');
  console.log('Auth hook state - User:', user?.id);
  console.log('Auth hook state - Profile:', profile?.id);
  console.log('Auth hook state - Loading:', loading);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('=== PROFILE FETCH ATTEMPT ===');
      console.log('Fetching profile for user ID:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('Profile fetch result:', { profileData, error });
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      return profileData;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('=== AUTH HOOK INITIALIZATION ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log('=== PROFILE FETCH FOR AUTH CHANGE ===');
          console.log('Fetching profile for user ID:', currentUser.id);
          
          const profileData = await fetchProfile(currentUser.id);
          setProfile(profileData);
          setLoading(false);
        } else {
          console.log('No session user, clearing profile and loading');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id, error);
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log('=== INITIAL PROFILE FETCH ===');
          console.log('Initial fetch for user ID:', currentUser.id);
          
          const profileData = await fetchProfile(currentUser.id);
          setProfile(profileData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, bypassEmailConfirmation?: boolean) => {
    console.log('SignUp called with bypass:', bypassEmailConfirmation);
    
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
    
    console.log('Signup result:', { data, error });
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
