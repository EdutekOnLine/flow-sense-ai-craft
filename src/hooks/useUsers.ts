
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  department: string | null;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, department')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[];
    },
  });
}
