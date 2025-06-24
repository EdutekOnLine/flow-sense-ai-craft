
// NeuraCRM Module
// Customer relationship management functionality

export const MODULE_CONFIG = {
  name: 'neura-crm',
  displayName: 'NeuraCRM',
  description: 'Customer relationship management module for managing contacts, companies, and sales activities',
  version: '1.0.0',
  requiredModules: ['neura-core'],
  isCore: false,
};

// CRM-specific types
export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  annual_revenue?: number;
  employee_count?: number;
  notes?: string;
  created_by: string;
  updated_by?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CrmContact {
  id: string;
  company_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  job_title?: string;
  department?: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  lead_source?: 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'trade_show' | 'other';
  lead_score: number;
  last_contact_date?: string;
  next_follow_up?: string;
  notes?: string;
  social_linkedin?: string;
  social_twitter?: string;
  created_by: string;
  updated_by?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CrmTask {
  id: string;
  contact_id?: string;
  company_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  assigned_to?: string;
  created_by: string;
  updated_by?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CrmMetrics {
  totalLeads: number;
  activeDeals: number;
  monthlyRevenue: number;
  conversionRate: number;
  newContactsThisWeek: number;
  tasksCompleted: number;
  upcomingTasks: number;
}
