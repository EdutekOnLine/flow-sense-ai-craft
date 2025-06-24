
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTeamBasedAccess } from './useTeamBasedAccess';
import type { Company, CrmContact, CrmTask, CrmMetrics } from '@/modules/neura-crm';

export function useCrmData() {
  const { profile } = useAuth();
  const { canAccessUser } = useTeamBasedAccess();

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['crm-companies', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Company[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch contacts with team-based filtering
  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['crm-contacts', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
        .from('crm_contacts')
        .select(`
          *,
          companies:company_id (
            name
          )
        `)
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter based on team access for non-admin users
      const isAdmin = profile.role === 'admin' || profile.role === 'root';
      if (isAdmin) {
        return data as (CrmContact & { companies?: { name: string } })[];
      }
      
      // For managers and employees, filter to only contacts they can access
      return (data || []).filter(contact => 
        canAccessUser(contact.created_by)
      ) as (CrmContact & { companies?: { name: string } })[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch tasks with team-based filtering
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['crm-tasks', profile?.workspace_id],
    queryFn: async () => {
      if (!profile?.workspace_id) return [];
      
      const { data, error } = await supabase
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
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const isAdmin = profile.role === 'admin' || profile.role === 'root';
      const filteredTasks = isAdmin ? data : (data || []).filter(task => 
        canAccessUser(task.created_by) || 
        (task.assigned_to && canAccessUser(task.assigned_to))
      );
      
      // Transform the data to match our expected type
      return (filteredTasks || []).map(task => ({
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
    enabled: !!profile?.workspace_id,
  });

  // Calculate CRM metrics including pipeline metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['crm-metrics', profile?.workspace_id],
    queryFn: async (): Promise<CrmMetrics> => {
      if (!profile?.workspace_id) {
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

      // Get leads count
      const { count: leadsCount } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', profile.workspace_id)
        .eq('status', 'lead');

      // Get prospects (active deals)
      const { count: prospectsCount } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', profile.workspace_id)
        .eq('status', 'prospect');

      // Get customers
      const { count: customersCount } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', profile.workspace_id)
        .eq('status', 'customer');

      // Get new contacts this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: newContactsCount } = await supabase
        .from('crm_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', profile.workspace_id)
        .gte('created_at', weekAgo.toISOString());

      // Get completed tasks
      const { count: completedTasksCount } = await supabase
        .from('crm_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', profile.workspace_id)
        .eq('status', 'completed');

      // Get upcoming tasks (due in next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { count: upcomingTasksCount } = await supabase
        .from('crm_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', profile.workspace_id)
        .in('status', ['pending', 'in_progress'])
        .lte('due_date', nextWeek.toISOString());

      // Get deals data for pipeline metrics
      const { data: dealsData } = await supabase
        .from('crm_deals')
        .select('value, probability, stage, created_at')
        .eq('workspace_id', profile.workspace_id);

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
    enabled: !!profile?.workspace_id,
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
