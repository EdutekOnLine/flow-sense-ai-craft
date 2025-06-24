
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Company, CrmContact, CrmTask, CrmMetrics } from '@/modules/neura-crm';

export function useCrmData() {
  const { profile } = useAuth();

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

  // Fetch contacts
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
      return data as (CrmContact & { companies?: { name: string } })[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Fetch tasks with proper type handling
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
          assigned_user:assigned_to (
            first_name,
            last_name
          )
        `)
        .eq('workspace_id', profile.workspace_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our expected type
      return data.map(task => ({
        ...task,
        crm_contacts: task.crm_contacts || undefined,
        companies: task.companies || undefined,
        profiles: task.assigned_user || undefined,
      })) as (CrmTask & {
        crm_contacts?: { first_name: string; last_name: string };
        companies?: { name: string };
        profiles?: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile?.workspace_id,
  });

  // Calculate CRM metrics
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
    },
    isLoading: companiesLoading || contactsLoading || tasksLoading || metricsLoading,
  };
}
