
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRootPermissions } from './useRootPermissions';
import type { CrmDeal, CrmDealActivity } from '@/modules/neura-crm';
import { toast } from '@/components/ui/use-toast';

export function useCrmDeals() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();
  const queryClient = useQueryClient();

  // Fetch deals - RLS policies handle team-based filtering automatically
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['crm-deals', profile?.workspace_id, isRootUser],
    queryFn: async () => {
      if (!profile?.workspace_id && !isRootUser) return [];
      
      let query = supabase
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
          )
        `)
        .order('created_at', { ascending: false });

      // Only filter by workspace for non-root users - RLS handles role restrictions
      if (!isRootUser) {
        query = query.eq('workspace_id', profile.workspace_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch assigned profiles separately to avoid relationship conflicts
      const assignedUserIds = [...new Set(data?.map(deal => deal.assigned_to).filter(Boolean))];
      
      let assignedProfiles: Record<string, { first_name: string; last_name: string }> = {};
      
      if (assignedUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', assignedUserIds);
        
        if (profilesData) {
          assignedProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { first_name: profile.first_name || '', last_name: profile.last_name || '' };
            return acc;
          }, {} as Record<string, { first_name: string; last_name: string }>);
        }
      }

      return (data || []).map(deal => ({
        ...deal,
        crm_contacts: deal.crm_contacts || undefined,
        companies: deal.companies || undefined,
        profiles: deal.assigned_to ? assignedProfiles[deal.assigned_to] : undefined,
      })) as (CrmDeal & {
        crm_contacts?: { first_name: string; last_name: string; email: string };
        companies?: { name: string };
        profiles?: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  // Fetch deal activities - RLS policies handle filtering
  const { data: dealActivities = [] } = useQuery({
    queryKey: ['crm-deal-activities', profile?.workspace_id, isRootUser],
    queryFn: async () => {
      if (!profile?.workspace_id && !isRootUser) return [];
      
      let query = supabase
        .from('crm_deal_activities')
        .select('*')
        .order('created_at', { ascending: false });

      // Only filter by workspace for non-root users
      if (!isRootUser) {
        query = query.eq('workspace_id', profile.workspace_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch creator profiles separately
      const creatorUserIds = [...new Set(data?.map(activity => activity.created_by).filter(Boolean))];
      
      let creatorProfiles: Record<string, { first_name: string; last_name: string }> = {};
      
      if (creatorUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', creatorUserIds);
        
        if (profilesData) {
          creatorProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { first_name: profile.first_name || '', last_name: profile.last_name || '' };
            return acc;
          }, {} as Record<string, { first_name: string; last_name: string }>);
        }
      }

      return (data || []).map(activity => ({
        ...activity,
        profiles: activity.created_by ? creatorProfiles[activity.created_by] : undefined,
      })) as (CrmDealActivity & {
        profiles?: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: Partial<CrmDeal>) => {
      if (!profile?.workspace_id && !isRootUser) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('crm_deals')
        .insert({
          title: dealData.title || '',
          description: dealData.description,
          value: dealData.value || 0,
          currency: dealData.currency || 'USD',
          stage: dealData.stage || 'lead',
          probability: dealData.probability || 25,
          source: dealData.source,
          expected_close_date: dealData.expected_close_date,
          contact_id: dealData.contact_id,
          company_id: dealData.company_id,
          assigned_to: dealData.assigned_to,
          notes: dealData.notes,
          workspace_id: profile.workspace_id || null, // Root users might not have workspace_id
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
      if (!profile?.workspace_id && !isRootUser) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('crm_deals')
        .update({
          ...updates,
          updated_by: profile.id,
        })
        .eq('id', id)
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
