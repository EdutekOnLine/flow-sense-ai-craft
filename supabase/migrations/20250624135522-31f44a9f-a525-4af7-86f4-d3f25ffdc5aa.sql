
-- Phase 1: Database Foundation for NeuraCRM Module (Fixed)

-- Create CRM-specific ENUMs (skip if they already exist)
DO $$ BEGIN
  CREATE TYPE public.contact_status AS ENUM ('lead', 'prospect', 'customer', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lead_source AS ENUM ('website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  annual_revenue NUMERIC,
  employee_count INTEGER,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crm_contacts table
CREATE TABLE public.crm_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile_phone TEXT,
  job_title TEXT,
  department TEXT,
  status public.contact_status NOT NULL DEFAULT 'lead',
  lead_source public.lead_source DEFAULT 'other',
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crm_tasks table (using existing task_status and task_priority enums)
CREATE TABLE public.crm_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.crm_contacts(id),
  company_id UUID REFERENCES public.companies(id),
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'pending',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_companies_workspace_id ON public.companies(workspace_id);
CREATE INDEX idx_companies_created_by ON public.companies(created_by);
CREATE INDEX idx_crm_contacts_workspace_id ON public.crm_contacts(workspace_id);
CREATE INDEX idx_crm_contacts_company_id ON public.crm_contacts(company_id);
CREATE INDEX idx_crm_contacts_status ON public.crm_contacts(status);
CREATE INDEX idx_crm_tasks_workspace_id ON public.crm_tasks(workspace_id);
CREATE INDEX idx_crm_tasks_assigned_to ON public.crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_contact_id ON public.crm_tasks(contact_id);
CREATE INDEX idx_crm_tasks_due_date ON public.crm_tasks(due_date);

-- Enable RLS on all CRM tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view companies in their workspace" ON public.companies
  FOR SELECT USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create companies in their workspace" ON public.companies
  FOR INSERT WITH CHECK (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update companies in their workspace" ON public.companies
  FOR UPDATE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete companies in their workspace" ON public.companies
  FOR DELETE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for crm_contacts
CREATE POLICY "Users can view contacts in their workspace" ON public.crm_contacts
  FOR SELECT USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create contacts in their workspace" ON public.crm_contacts
  FOR INSERT WITH CHECK (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update contacts in their workspace" ON public.crm_contacts
  FOR UPDATE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete contacts in their workspace" ON public.crm_contacts
  FOR DELETE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for crm_tasks
CREATE POLICY "Users can view tasks in their workspace" ON public.crm_tasks
  FOR SELECT USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create tasks in their workspace" ON public.crm_tasks
  FOR INSERT WITH CHECK (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update tasks in their workspace" ON public.crm_tasks
  FOR UPDATE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete tasks in their workspace" ON public.crm_tasks
  FOR DELETE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_companies BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_crm_contacts BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_crm_tasks BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert NeuraCRM module into modules table
INSERT INTO public.modules (name, display_name, description, required_modules, is_core, version, settings_schema)
VALUES (
  'neura-crm',
  'NeuraCRM',
  'Customer relationship management module for managing contacts, companies, and sales activities',
  ARRAY['neura-core'],
  false,
  '1.0.0',
  '{
    "lead_score_threshold": {
      "type": "number",
      "default": 70,
      "description": "Minimum lead score for hot leads"
    },
    "auto_follow_up_days": {
      "type": "number", 
      "default": 7,
      "description": "Default days for follow-up reminders"
    },
    "default_lead_source": {
      "type": "string",
      "default": "website",
      "description": "Default lead source for new contacts"
    }
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  required_modules = EXCLUDED.required_modules,
  settings_schema = EXCLUDED.settings_schema,
  updated_at = now();
