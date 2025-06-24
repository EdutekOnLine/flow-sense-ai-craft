
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserInvitations } from './useUserInvitations';
import { useUserDeletion } from './useUserDeletion';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  workspace_id?: string;
  created_at: string;
}

export function useUserManagement() {
  const { invitations, createInvitation, resendInvitation, deleteInvitation } = useUserInvitations();
  const { deleteUser } = useUserDeletion();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  return {
    allUsers,
    invitations,
    createInvitation,
    resendInvitation,
    deleteInvitation,
    deleteUser,
  };
}
