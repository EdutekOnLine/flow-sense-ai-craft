
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRootPermissions } from './useRootPermissions';
import { useToast } from './use-toast';
import type { CrmCommunication } from '@/modules/neura-crm';

export function useCrmCommunications(entityId?: string, entityType?: 'contact' | 'company' | 'deal') {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch communications with filters
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['crm-communications', profile?.workspace_id, entityId, entityType, isRootUser],
    queryFn: async (): Promise<CrmCommunication[]> => {
      if (!profile?.workspace_id && !isRootUser) return [];
      
      let query = supabase
        .from('crm_communications' as any)
        .select(`
          *,
          crm_contacts:contact_id (
            first_name,
            last_name
          ),
          companies:company_id (
            name
          ),
          crm_deals:deal_id (
            title
          ),
          profiles:created_by (
            first_name,
            last_name
          )
        `)
        .order('communication_date', { ascending: false });

      // Apply entity filter if specified
      if (entityId && entityType) {
        switch (entityType) {
          case 'contact':
            query = query.eq('contact_id', entityId);
            break;
          case 'company':
            query = query.eq('company_id', entityId);
            break;
          case 'deal':
            query = query.eq('deal_id', entityId);
            break;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((comm: any) => ({
        id: comm.id,
        workspace_id: comm.workspace_id,
        contact_id: comm.contact_id,
        company_id: comm.company_id,
        deal_id: comm.deal_id,
        type: comm.type as CrmCommunication['type'],
        summary: comm.summary,
        outcome: comm.outcome,
        communication_date: comm.communication_date,
        created_by: comm.created_by,
        created_at: comm.created_at,
        updated_at: comm.updated_at,
        contact: comm.crm_contacts,
        company: comm.companies,
        deal: comm.crm_deals,
        creator: comm.profiles,
      }));
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  // Create communication mutation
  const createCommunication = useMutation({
    mutationFn: async (data: Omit<CrmCommunication, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('crm_communications' as any)
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-communications'] });
      toast({
        title: 'Success',
        description: 'Communication logged successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating communication:', error);
      toast({
        title: 'Error',
        description: 'Failed to log communication',
        variant: 'destructive',
      });
    },
  });

  // Update communication mutation
  const updateCommunication = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CrmCommunication> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('crm_communications' as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-communications'] });
      toast({
        title: 'Success',
        description: 'Communication updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating communication:', error);
      toast({
        title: 'Error',
        description: 'Failed to update communication',
        variant: 'destructive',
      });
    },
  });

  // Delete communication mutation
  const deleteCommunication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_communications' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-communications'] });
      toast({
        title: 'Success',
        description: 'Communication deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting communication:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete communication',
        variant: 'destructive',
      });
    },
  });

  return {
    communications,
    isLoading,
    createCommunication: createCommunication.mutate,
    updateCommunication: updateCommunication.mutate,
    deleteCommunication: deleteCommunication.mutate,
    isCreating: createCommunication.isPending,
    isUpdating: updateCommunication.isPending,
    isDeleting: deleteCommunication.isPending,
  };
}
