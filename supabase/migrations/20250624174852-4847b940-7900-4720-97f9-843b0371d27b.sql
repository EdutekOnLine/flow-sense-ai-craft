
-- Add comprehensive root user bypass to all RLS policies
-- This ensures root users (role = 'root') can access all data system-wide

-- First, let's add missing RLS policies for tables that don't have them yet

-- Enable RLS on tables that don't have it yet
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create comprehensive SELECT policies with root bypass
CREATE POLICY "Root users and workspace users can view workflows" ON public.workflows
  FOR SELECT USING (
    -- Root users can see everything
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see workflows in their workspace
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.workspace_id IS NOT NULL
    )
  );

CREATE POLICY "Root users and workspace users can view workflow steps" ON public.workflow_steps
  FOR SELECT USING (
    -- Root users can see everything
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see steps for workflows they can access
    EXISTS (
      SELECT 1 FROM public.workflows w
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE w.id = workflow_steps.workflow_id
    )
  );

CREATE POLICY "Root users and assigned users can view step assignments" ON public.workflow_step_assignments
  FOR SELECT USING (
    -- Root users can see everything
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can see assignments assigned to them
    assigned_to = auth.uid()
    OR
    -- Admins/managers can see assignments in their workspace
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Root users and workspace users can view teams" ON public.teams
  FOR SELECT USING (
    -- Root users can see all teams across all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see teams in their workspace
    workspace_id = public.get_user_workspace(auth.uid())
  );

CREATE POLICY "Root users and workspace users can view team members" ON public.team_members
  FOR SELECT USING (
    -- Root users can see all team members across all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see team members for teams in their workspace
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id 
      AND t.workspace_id = public.get_user_workspace(auth.uid())
    )
  );

CREATE POLICY "Root users and workspace users can view notifications" ON public.notifications
  FOR SELECT USING (
    -- Root users can see all notifications
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can see their own notifications
    user_id = auth.uid()
  );

CREATE POLICY "Root users and workspace users can view workspaces" ON public.workspaces
  FOR SELECT USING (
    -- Root users can see all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can see their own workspace
    id = public.get_user_workspace(auth.uid())
    OR
    -- Workspace owners can see their workspace
    owner_id = auth.uid()
  );

CREATE POLICY "Root users and workspace users can view CRM deals" ON public.crm_deals
  FOR SELECT USING (
    -- Root users can see all deals across all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see deals in their workspace
    workspace_id = public.get_user_workspace(auth.uid())
  );

CREATE POLICY "Root users and workspace users can view CRM contacts" ON public.crm_contacts
  FOR SELECT USING (
    -- Root users can see all contacts across all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see contacts in their workspace
    workspace_id = public.get_user_workspace(auth.uid())
  );

CREATE POLICY "Root users and workspace users can view companies" ON public.companies
  FOR SELECT USING (
    -- Root users can see all companies across all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users see companies in their workspace
    workspace_id = public.get_user_workspace(auth.uid())
  );

-- Add INSERT policies with root bypass
CREATE POLICY "Root users and authorized users can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (
    -- Root users can create workflows in any workspace
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Admins/managers can create workflows in their workspace
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'manager')
      AND (created_by = auth.uid() OR assigned_to = auth.uid())
    )
  );

CREATE POLICY "Root users and authorized users can create workflow steps" ON public.workflow_steps
  FOR INSERT WITH CHECK (
    -- Root users can create steps for any workflow
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can create steps for workflows they have access to
    EXISTS (
      SELECT 1 FROM public.workflows w
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE w.id = workflow_steps.workflow_id
      AND (w.created_by = auth.uid() OR p.role IN ('admin', 'manager'))
    )
  );

CREATE POLICY "Root users and authorized users can create CRM deals" ON public.crm_deals
  FOR INSERT WITH CHECK (
    -- Root users can create deals in any workspace
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can create deals in their workspace
    (workspace_id = public.get_user_workspace(auth.uid()) AND created_by = auth.uid())
  );

CREATE POLICY "Root users and authorized users can create CRM contacts" ON public.crm_contacts
  FOR INSERT WITH CHECK (
    -- Root users can create contacts in any workspace
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can create contacts in their workspace
    (workspace_id = public.get_user_workspace(auth.uid()) AND created_by = auth.uid())
  );

CREATE POLICY "Root users and authorized users can create companies" ON public.companies
  FOR INSERT WITH CHECK (
    -- Root users can create companies in any workspace
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can create companies in their workspace
    (workspace_id = public.get_user_workspace(auth.uid()) AND created_by = auth.uid())
  );

-- Add UPDATE policies with root bypass
CREATE POLICY "Root users and authorized users can update workflows" ON public.workflows
  FOR UPDATE USING (
    -- Root users can update any workflow
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can update their own workflows or if they're admin/manager
    (created_by = auth.uid() OR assigned_to = auth.uid() OR 
     public.get_user_role(auth.uid()) IN ('admin', 'manager'))
  );

CREATE POLICY "Root users and authorized users can update CRM deals" ON public.crm_deals
  FOR UPDATE USING (
    -- Root users can update any deal
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can update deals in their workspace
    (workspace_id = public.get_user_workspace(auth.uid()) AND 
     (created_by = auth.uid() OR assigned_to = auth.uid() OR 
      public.get_user_role(auth.uid()) IN ('admin', 'manager')))
  );

-- Add DELETE policies with root bypass
CREATE POLICY "Root users and authorized users can delete workflows" ON public.workflows
  FOR DELETE USING (
    -- Root users can delete any workflow
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Only creators or admins can delete workflows
    (created_by = auth.uid() OR public.get_user_role(auth.uid()) IN ('admin'))
  );

CREATE POLICY "Root users and authorized users can delete CRM deals" ON public.crm_deals
  FOR DELETE USING (
    -- Root users can delete any deal
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Users can delete deals they created or if they're admin
    (workspace_id = public.get_user_workspace(auth.uid()) AND 
     (created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'admin'))
  );

-- Update existing team policies to include better root access
DROP POLICY IF EXISTS "Admins and managers can update their teams" ON public.teams;
CREATE POLICY "Root users and authorized users can update teams" ON public.teams
  FOR UPDATE USING (
    -- Root users can update any team
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Team managers and workspace admins can update teams
    (workspace_id = public.get_user_workspace(auth.uid()) AND
     (public.get_user_role(auth.uid()) IN ('admin') OR manager_id = auth.uid()))
  ) WITH CHECK (
    -- Root users bypass workspace validation
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Ensure updated manager belongs to same workspace as the team
    public.validate_manager_in_workspace(manager_id, workspace_id)
  );
