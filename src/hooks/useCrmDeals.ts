
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { CrmDeal, CrmDealActivity } from '@/modules/neura-crm';
import { toast } from '@/components/ui/use-toast';

export function useCrmDeals() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['crm-deals', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('crm_deals')
        .select(`
          *,
          crm_contacts:contact_id (
            first_name,
            last_name,
            email
          ),
          companies:company_id (
            name
          ),
          profiles:assigned_to (
            first_name,
            last_name
          )
        `)
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (CrmDeal & {
        crm_contacts?: { first_name: string; last_name: string; email: string };
        companies?: { name: string };
        profiles?: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch deal activities
  const { data: dealActivities = [] } = useQuery({
    queryKey: ['crm-deal-activities', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('crm_deal_activities')
        .select(`
          *,
          profiles:created_by (
            first_name,
            last_name
          )
        `)
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (CrmDealActivity & {
        profiles?: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: Partial<CrmDeal>) => {
      if (!profile?.workspace_id) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('crm_deals')
        .insert({
          ...dealData,
          workspace_id: profile.workspace_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast({ title: 'Deal created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating deal', description: error.message, variant: 'destructive' });
    },
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrmDeal> & { id: string }) => {
      if (!profile?.workspace_id) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('crm_deals')
        .update({
          ...updates,
          updated_by: profile.id,
        })
        .eq('id', id)
        .eq('workspace_id', profile.workspace_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      queryClient.invalidateQueries({ queryKey: ['crm-deal-activities'] });
    },
    onError: (error) => {
      toast({ title: 'Error updating deal', description: error.message, variant: 'destructive' });
    },
  });

  // Move deal to stage mutation
  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, newStage }: { dealId: string; newStage: CrmDeal['stage'] }) => {
      return updateDealMutation.mutateAsync({ id: dealId, stage: newStage });
    },
  });

  return {
    deals,
    dealActivities,
    isLoading: dealsLoading,
    createDeal: createDealMutation.mutate,
    updateDeal: updateDealMutation.mutate,
    moveDeal: moveDealMutation.mutate,
    isCreating: createDealMutation.isPending,
    isUpdating: updateDealMutation.isPending,
  };
}
