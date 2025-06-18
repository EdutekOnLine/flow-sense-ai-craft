
-- Phase 1: Database Foundation & Cleanup for NeuraCore Platform

-- First, let's clear all existing workflow data for fresh start
TRUNCATE TABLE workflow_step_assignments CASCADE;
TRUNCATE TABLE workflow_steps CASCADE;
TRUNCATE TABLE workflow_instances CASCADE;
TRUNCATE TABLE workflows CASCADE;
TRUNCATE TABLE saved_workflows CASCADE;
TRUNCATE TABLE workflow_definitions CASCADE;
TRUNCATE TABLE workflow_templates CASCADE;
TRUNCATE TABLE workflow_comments CASCADE;

-- Create workspaces table for multi-tenant support
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create modules registry table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_core BOOLEAN NOT NULL DEFAULT false,
  settings_schema JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_modules junction table for enabling/disabling modules per workspace
CREATE TABLE public.workspace_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  activated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, module_id)
);

-- Add workspace_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view their workspace" 
  ON public.workspaces 
  FOR SELECT 
  USING (
    id IN (
      SELECT workspace_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Root users can manage all workspaces" 
  ON public.workspaces 
  FOR ALL 
  USING (public.get_current_user_role() = 'root');

CREATE POLICY "Workspace owners can manage their workspace" 
  ON public.workspaces 
  FOR ALL 
  USING (owner_id = auth.uid());

-- Create RLS policies for modules (all authenticated users can view modules)
CREATE POLICY "Authenticated users can view modules" 
  ON public.modules 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Root users can manage modules" 
  ON public.modules 
  FOR ALL 
  USING (public.get_current_user_role() = 'root');

-- Create RLS policies for workspace_modules
CREATE POLICY "Users can view their workspace modules" 
  ON public.workspace_modules 
  FOR SELECT 
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Root users can manage all workspace modules" 
  ON public.workspace_modules 
  FOR ALL 
  USING (public.get_current_user_role() = 'root');

CREATE POLICY "Workspace owners can manage their workspace modules" 
  ON public.workspace_modules 
  FOR ALL 
  USING (
    workspace_id IN (
      SELECT id 
      FROM public.workspaces 
      WHERE owner_id = auth.uid()
    )
  );

-- Insert core modules into the registry
INSERT INTO public.modules (name, display_name, description, is_core) VALUES
('neura-core', 'NeuraCore', 'Core platform functionality including user management and authentication', true),
('neura-flow', 'NeuraFlow', 'Workflow automation and process management module', false),
('neura-crm', 'NeuraCRM', 'Customer relationship management module', false),
('neura-forms', 'NeuraForms', 'Dynamic form builder and data collection module', false),
('neura-edu', 'NeuraEdu', 'Educational content and learning management module', false);

-- Create default workspace for existing users and assign them to it
DO $$
DECLARE
  default_workspace_id UUID;
  user_record RECORD;
BEGIN
  -- Create a default workspace
  INSERT INTO public.workspaces (name, slug, description, owner_id)
  SELECT 'Default Workspace', 'default', 'Default workspace for existing users', id
  FROM public.profiles 
  WHERE role = 'root' 
  LIMIT 1
  RETURNING id INTO default_workspace_id;
  
  -- If no root user exists, create workspace with first admin user
  IF default_workspace_id IS NULL THEN
    INSERT INTO public.workspaces (name, slug, description, owner_id)
    SELECT 'Default Workspace', 'default', 'Default workspace for existing users', id
    FROM public.profiles 
    WHERE role = 'admin' 
    LIMIT 1
    RETURNING id INTO default_workspace_id;
  END IF;
  
  -- Assign all existing users to the default workspace
  UPDATE public.profiles 
  SET workspace_id = default_workspace_id 
  WHERE workspace_id IS NULL;
  
  -- Enable NeuraCore and NeuraFlow modules for the default workspace
  INSERT INTO public.workspace_modules (workspace_id, module_id, is_active)
  SELECT 
    default_workspace_id,
    m.id,
    true
  FROM public.modules m
  WHERE m.name IN ('neura-core', 'neura-flow');
END $$;

-- Add triggers for updated_at timestamps
CREATE TRIGGER handle_workspaces_updated_at BEFORE UPDATE ON public.workspaces 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_modules_updated_at BEFORE UPDATE ON public.modules 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_workspace_modules_updated_at BEFORE UPDATE ON public.workspace_modules 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
