
-- Enable RLS on all tables that don't have it yet (skip if already enabled)
DO $$
BEGIN
  -- Enable RLS on tables that don't have it
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflows' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflow_steps' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflow_instances' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflow_step_assignments' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflow_step_assignments ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflow_comments' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflow_comments ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'saved_workflows' AND relrowsecurity = true) THEN
    ALTER TABLE public.saved_workflows ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflow_definitions' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workflow_templates' AND relrowsecurity = true) THEN
    ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notifications' AND relrowsecurity = true) THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles' AND relrowsecurity = true) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workspaces' AND relrowsecurity = true) THEN
    ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'modules' AND relrowsecurity = true) THEN
    ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'workspace_modules' AND relrowsecurity = true) THEN
    ALTER TABLE public.workspace_modules ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'module_audit_logs' AND relrowsecurity = true) THEN
    ALTER TABLE public.module_audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_invitations' AND relrowsecurity = true) THEN
    ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_presence' AND relrowsecurity = true) THEN
    ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_workspace_id(user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT workspace_id FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.can_user_access_workspace(user_id UUID, target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('root', 'admin')
  );
$$;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "Users can view profiles in their workspace" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their workspace" ON public.profiles;

-- Profiles RLS policies
CREATE POLICY "Users can view profiles in their workspace" ON public.profiles
  FOR SELECT USING (
    public.can_user_access_workspace(auth.uid(), workspace_id)
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their workspace" ON public.profiles
  FOR ALL USING (
    public.is_workspace_admin(auth.uid()) AND 
    public.can_user_access_workspace(auth.uid(), workspace_id)
  );

-- Workspaces RLS policies
DROP POLICY IF EXISTS "Users can view their workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can manage their workspace" ON public.workspaces;

CREATE POLICY "Users can view their workspace" ON public.workspaces
  FOR SELECT USING (
    public.can_user_access_workspace(auth.uid(), id)
  );

CREATE POLICY "Workspace owners can manage their workspace" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid());

-- Modules RLS policies
DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.modules;
DROP POLICY IF EXISTS "Root users can manage modules" ON public.modules;

CREATE POLICY "Authenticated users can view modules" ON public.modules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Root users can manage modules" ON public.modules
  FOR ALL USING (public.is_user_role(auth.uid(), 'root'));

-- Workspace modules RLS policies
DROP POLICY IF EXISTS "Users can view workspace modules in their workspace" ON public.workspace_modules;
DROP POLICY IF EXISTS "Admins can manage workspace modules" ON public.workspace_modules;

CREATE POLICY "Users can view workspace modules in their workspace" ON public.workspace_modules
  FOR SELECT USING (
    public.can_user_access_workspace(auth.uid(), workspace_id)
  );

CREATE POLICY "Admins can manage workspace modules" ON public.workspace_modules
  FOR ALL USING (
    public.is_workspace_admin(auth.uid()) AND 
    public.can_user_access_workspace(auth.uid(), workspace_id)
  );

-- Workflows RLS policies (NeuraFlow module)
DROP POLICY IF EXISTS "Users can view workflows in their workspace" ON public.workflows;
DROP POLICY IF EXISTS "Users can create workflows if they have permissions" ON public.workflows;
DROP POLICY IF EXISTS "Users can update workflows they created or are assigned to" ON public.workflows;
DROP POLICY IF EXISTS "Workflow managers can delete workflows" ON public.workflows;

CREATE POLICY "Users can view workflows in their workspace" ON public.workflows
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    public.can_user_access_workspace(auth.uid(), 
      (SELECT workspace_id FROM public.profiles WHERE id = created_by)
    )
  );

CREATE POLICY "Users can create workflows if they have permissions" ON public.workflows
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    public.has_workflow_permissions(auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update workflows they created or are assigned to" ON public.workflows
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (created_by = auth.uid() OR assigned_to = auth.uid() OR public.has_workflow_permissions(auth.uid()))
  );

CREATE POLICY "Workflow managers can delete workflows" ON public.workflows
  FOR DELETE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    public.has_workflow_permissions(auth.uid())
  );

-- Add function to check API access for edge functions
CREATE OR REPLACE FUNCTION public.verify_api_access(
  p_user_id UUID,
  p_module_name TEXT,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_workspace_id UUID;
  has_module_access BOOLEAN;
  user_role TEXT;
BEGIN
  -- Get user's workspace and role
  SELECT workspace_id, role INTO user_workspace_id, user_role
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if user has access to the module
  SELECT public.can_access_module_data(p_user_id, p_module_name) INTO has_module_access;
  
  -- For write operations, check additional permissions
  IF p_action = 'write' OR p_action = 'delete' THEN
    RETURN has_module_access AND user_role IN ('root', 'admin', 'manager');
  END IF;
  
  RETURN has_module_access;
END;
$$;

-- Add policies for remaining tables (only if they don't exist)
DO $$
BEGIN
  -- Notifications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
    EXECUTE 'CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can create notifications') THEN
    EXECUTE 'CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true)';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
    EXECUTE 'CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete their own notifications') THEN
    EXECUTE 'CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid())';
  END IF;
END $$;
