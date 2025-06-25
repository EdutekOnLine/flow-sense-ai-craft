
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRootPermissions } from './useRootPermissions';
import type { Company, CrmContact, CrmTask, CrmMetrics } from '@/modules/neura-crm';

export function useCrmData() {
  const { profile } = useAuth();
  const { isRootUser } = useRootPermissions();

  // Fetch companies - RLS policies now handle role-based filtering
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['crm-companies', profile?.workspace_id, isRootUser],
    queryFn: async () => {
      if (!profile?.workspace_id && !isRootUser) return [];
      
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      // Only filter by workspace for non-root users
      if (!isRootUser) {
        query = query.eq('workspace_id', profile.workspace_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Company[];
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  // Fetch contacts - RLS policies handle team-based filtering
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['crm-contacts', profile?.workspace_id, isRootUser],
    queryFn: async () => {
      if (!profile?.workspace_id && !isRootUser) return [];
      
      let query = supabase
        .from('crm_contacts')
        .select(`
          *,
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
      
      return data as (CrmContact & { companies?: { name: string } })[];
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  // Fetch tasks - RLS policies handle team-based and assignment-based filtering
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['crm-tasks', profile?.workspace_id, isRootUser],
    queryFn: async () => {
      if (!profile?.workspace_id && !isRootUser) return [];
      
      let query = supabase
        .from('crm_tasks')
        .select(`
          *,
          crm_contacts:contact_id (
            first_name,
            last_name
          ),
          companies:company_id (
            name
          ),
          profiles!crm_tasks_assigned_to_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      // Only filter by workspace for non-root users - RLS handles role restrictions
      if (!isRootUser) {
        query = query.eq('workspace_id', profile.workspace_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match our expected type
      return (data || []).map(task => ({
        id: task.id,
        contact_id: task.contact_id,
        company_id: task.company_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        completed_at: task.completed_at,
        assigned_to: task.assigned_to,
        created_by: task.created_by,
        updated_by: task.updated_by,
        workspace_id: task.workspace_id,
        created_at: task.created_at,
        updated_at: task.updated_at,
        crm_contacts: task.crm_contacts || undefined,
        companies: task.companies || undefined,
        profiles: task.profiles || undefined,
      })) as (CrmTask & {
        crm_contacts?: { first_name: string; last_name: string };
        companies?: { name: string };
        profiles?: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  // Calculate CRM metrics - scoped by RLS policies
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['crm-metrics', profile?.workspace_id, isRootUser],
    queryFn: async (): Promise<CrmMetrics> => {
      if (!profile?.workspace_id && !isRootUser) {
        return {
          totalLeads: 0,
          activeDeals: 0,
          monthlyRevenue: 0,
          conversionRate: 0,
          newContactsThisWeek: 0,
          tasksCompleted: 0,
          upcomingTasks: 0,
          totalPipelineValue: 0,
          weightedPipelineValue: 0,
          averageDealSize: 0,
          dealsWonThisMonth: 0,
          dealsLostThisMonth: 0,
        };
      }

      // Get leads count - RLS will filter appropriately
      let contactQuery = supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'lead');
      
      if (!isRootUser) {
        contactQuery = contactQuery.eq('workspace_id', profile.workspace_id);
      }

      const { count: leadsCount } = await contactQuery;

      // Get prospects (active deals) - RLS will filter appropriately
      let prospectQuery = supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'prospect');
      
      if (!isRootUser) {
        prospectQuery = prospectQuery.eq('workspace_id', profile.workspace_id);
      }

      const { count: prospectsCount } = await prospectQuery;

      // Get customers - RLS will filter appropriately
      let customerQuery = supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'customer');
      
      if (!isRootUser) {
        customerQuery = customerQuery.eq('workspace_id', profile.workspace_id);
      }

      const { count: customersCount } = await customerQuery;

      // Get new contacts this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      let newContactQuery = supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());
      
      if (!isRootUser) {
        newContactQuery = newContactQuery.eq('workspace_id', profile.workspace_id);
      }

      const { count: newContactsCount } = await newContactQuery;

      // Get completed tasks
      let completedTaskQuery = supabase
        .from('crm_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      if (!isRootUser) {
        completedTaskQuery = completedTaskQuery.eq('workspace_id', profile.workspace_id);
      }

      const { count: completedTasksCount } = await completedTaskQuery;

      // Get upcoming tasks (due in next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      let upcomingTaskQuery = supabase
        .from('crm_tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress'])
        .lte('due_date', nextWeek.toISOString());
      
      if (!isRootUser) {
        upcomingTaskQuery = upcomingTaskQuery.eq('workspace_id', profile.workspace_id);
      }

      const { count: upcomingTasksCount } = await upcomingTaskQuery;

      // Get deals data for pipeline metrics
      let dealsQuery = supabase
        .from('crm_deals')
        .select('value, probability, stage, created_at');
      
      if (!isRootUser) {
        dealsQuery = dealsQuery.eq('workspace_id', profile.workspace_id);
      }

      const { data: dealsData } = await dealsQuery;

      const deals = dealsData || [];
      const totalPipelineValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const weightedPipelineValue = deals.reduce((sum, deal) => sum + ((deal.value || 0) * (deal.probability || 0) / 100), 0);
      const averageDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;

      // Get deals won/lost this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const dealsWonThisMonth = deals.filter(deal => 
        deal.stage === 'won' && new Date(deal.created_at) >= monthAgo
      ).length;
      
      const dealsLostThisMonth = deals.filter(deal => 
        deal.stage === 'lost' && new Date(deal.created_at) >= monthAgo
      ).length;

      // Calculate conversion rate
      const totalContacts = (leadsCount || 0) + (prospectsCount || 0) + (customersCount || 0);
      const conversionRate = totalContacts > 0 ? ((customersCount || 0) / totalContacts) * 100 : 0;

      return {
        totalLeads: leadsCount || 0,
        activeDeals: prospectsCount || 0,
        monthlyRevenue: Math.floor(Math.random() * 50000) + 10000, // Mock data for now
        conversionRate: Math.round(conversionRate * 100) / 100,
        newContactsThisWeek: newContactsCount || 0,
        tasksCompleted: completedTasksCount || 0,
        upcomingTasks: upcomingTasksCount || 0,
        totalPipelineValue,
        weightedPipelineValue,
        averageDealSize,
        dealsWonThisMonth,
        dealsLostThisMonth,
      };
    },
    enabled: !!profile && (!!profile?.workspace_id || isRootUser),
  });

  return {
    companies,
    contacts,
    tasks,
    metrics: metrics || {
      totalLeads: 0,
      activeDeals: 0,
      monthlyRevenue: 0,
      conversionRate: 0,
      newContactsThisWeek: 0,
      tasksCompleted: 0,
      upcomingTasks: 0,
      totalPipelineValue: 0,
      weightedPipelineValue: 0,
      averageDealSize: 0,
      dealsWonThisMonth: 0,
      dealsLostThisMonth: 0,
    },
    isLoading: companiesLoading || contactsLoading || tasksLoading || metricsLoading,
  };
}
