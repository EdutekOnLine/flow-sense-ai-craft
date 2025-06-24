
-- Create deal stage enum
DO $$ BEGIN
  CREATE TYPE public.deal_stage AS ENUM ('lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create deal source enum
DO $$ BEGIN
  CREATE TYPE public.deal_source AS ENUM ('website', 'referral', 'cold_call', 'social_media', 'email_campaign', 'trade_show', 'partner', 'existing_customer', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create crm_deals table
CREATE TABLE public.crm_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stage public.deal_stage NOT NULL DEFAULT 'lead',
  probability INTEGER DEFAULT 25 CHECK (probability >= 0 AND probability <= 100),
  source public.deal_source DEFAULT 'other',
  expected_close_date DATE,
  actual_close_date DATE,
  contact_id UUID REFERENCES public.crm_contacts(id),
  company_id UUID REFERENCES public.companies(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create deal activities table for tracking changes
CREATE TABLE public.crm_deal_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'stage_change', 'value_update', 'note_added', 'created', etc.
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_crm_deals_workspace_id ON public.crm_deals(workspace_id);
CREATE INDEX idx_crm_deals_contact_id ON public.crm_deals(contact_id);
CREATE INDEX idx_crm_deals_company_id ON public.crm_deals(company_id);
CREATE INDEX idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX idx_crm_deals_assigned_to ON public.crm_deals(assigned_to);
CREATE INDEX idx_crm_deals_expected_close_date ON public.crm_deals(expected_close_date);
CREATE INDEX idx_crm_deal_activities_deal_id ON public.crm_deal_activities(deal_id);

-- Enable RLS on deals tables
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deal_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_deals
CREATE POLICY "Users can view deals in their workspace" ON public.crm_deals
  FOR SELECT USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create deals in their workspace" ON public.crm_deals
  FOR INSERT WITH CHECK (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update deals in their workspace" ON public.crm_deals
  FOR UPDATE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete deals in their workspace" ON public.crm_deals
  FOR DELETE USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for crm_deal_activities
CREATE POLICY "Users can view deal activities in their workspace" ON public.crm_deal_activities
  FOR SELECT USING (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create deal activities in their workspace" ON public.crm_deal_activities
  FOR INSERT WITH CHECK (workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_crm_deals BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger to automatically log deal activities when deals are updated
CREATE OR REPLACE FUNCTION public.log_deal_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log stage changes
  IF OLD.stage != NEW.stage THEN
    INSERT INTO public.crm_deal_activities (
      deal_id, activity_type, old_value, new_value, description, created_by, workspace_id
    ) VALUES (
      NEW.id, 
      'stage_change', 
      OLD.stage::TEXT, 
      NEW.stage::TEXT, 
      'Deal moved from ' || OLD.stage || ' to ' || NEW.stage,
      NEW.updated_by,
      NEW.workspace_id
    );
  END IF;

  -- Log value changes
  IF OLD.value != NEW.value THEN
    INSERT INTO public.crm_deal_activities (
      deal_id, activity_type, old_value, new_value, description, created_by, workspace_id
    ) VALUES (
      NEW.id, 
      'value_update', 
      OLD.value::TEXT, 
      NEW.value::TEXT, 
      'Deal value changed from $' || OLD.value || ' to $' || NEW.value,
      NEW.updated_by,
      NEW.workspace_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_deal_activity_trigger
  AFTER UPDATE ON public.crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deal_activity();

-- Trigger to log deal creation
CREATE OR REPLACE FUNCTION public.log_deal_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.crm_deal_activities (
    deal_id, activity_type, new_value, description, created_by, workspace_id
  ) VALUES (
    NEW.id, 
    'created', 
    NEW.stage::TEXT, 
    'Deal created with stage: ' || NEW.stage,
    NEW.created_by,
    NEW.workspace_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_deal_creation_trigger
  AFTER INSERT ON public.crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deal_creation();

-- Enable realtime for deals
ALTER TABLE public.crm_deals REPLICA IDENTITY FULL;
ALTER TABLE public.crm_deal_activities REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deal_activities;
