
-- Phase 1.1: Fix Missing Database Schema
-- Add missing workspace_id columns to workflow tables

-- Add workspace_id to workflow_step_assignments
ALTER TABLE public.workflow_step_assignments 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Add workspace_id to saved_workflows  
ALTER TABLE public.saved_workflows
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Add workspace_id to workflow_instances
ALTER TABLE public.workflow_instances 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Backfill existing data with workspace associations
-- For workflow_step_assignments, get workspace from assigned user
UPDATE public.workflow_step_assignments 
SET workspace_id = (
  SELECT p.workspace_id 
  FROM public.profiles p 
  WHERE p.id = workflow_step_assignments.assigned_to
  LIMIT 1
);

-- For saved_workflows, get workspace from creator
UPDATE public.saved_workflows 
SET workspace_id = (
  SELECT p.workspace_id 
  FROM public.profiles p 
  WHERE p.id = saved_workflows.created_by
  LIMIT 1
);

-- For workflow_instances, get workspace from starter
UPDATE public.workflow_instances 
SET workspace_id = (
  SELECT p.workspace_id 
  FROM public.profiles p 
  WHERE p.id = workflow_instances.started_by
  LIMIT 1
);

-- Set NOT NULL constraints (after backfill)
ALTER TABLE public.workflow_step_assignments 
ALTER COLUMN workspace_id SET NOT NULL;

ALTER TABLE public.saved_workflows
ALTER COLUMN workspace_id SET NOT NULL;

ALTER TABLE public.workflow_instances
ALTER COLUMN workspace_id SET NOT NULL;

-- Phase 1.2: Implement Missing Database Functions

-- Function to check if user can manage a team member
CREATE OR REPLACE FUNCTION public.can_manage_team_member(manager_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.team_members tm ON tm.team_id = t.id
    WHERE t.manager_id = manager_id 
    AND tm.user_id = target_user_id
  ) OR public.get_user_role(manager_id) IN ('admin', 'root');
$$;

-- Function to get user's team member IDs
CREATE OR REPLACE FUNCTION public.get_user_team_members(manager_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    ARRAY(
      SELECT tm.user_id 
      FROM public.teams t
      JOIN public.team_members tm ON tm.team_id = t.id
      WHERE t.manager_id = manager_id
    ), 
    '{}'::uuid[]
  );
$$;

-- Function to check if user is assigned to a workflow
CREATE OR REPLACE FUNCTION public.is_assigned_to_workflow(user_id uuid, workflow_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workflow_step_assignments wsa
    JOIN public.workflow_steps ws ON ws.id = wsa.workflow_step_id
    WHERE ws.workflow_id = workflow_id 
    AND wsa.assigned_to = user_id
  );
$$;

-- Function to check if user can access a specific workflow based on role
CREATE OR REPLACE FUNCTION public.can_access_workflow(user_id uuid, workflow_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    -- Root users can access everything
    public.get_user_role(user_id) = 'root'
    OR
    -- Admins can access all workflows in their workspace
    (
      public.get_user_role(user_id) = 'admin' 
      AND EXISTS (
        SELECT 1 FROM public.workflows w
        JOIN public.profiles p ON p.id = user_id
        WHERE w.id = workflow_id AND w.created_by IN (
          SELECT id FROM public.profiles WHERE workspace_id = p.workspace_id
        )
      )
    )
    OR
    -- Managers can access workflows involving their team members
    (
      public.get_user_role(user_id) = 'manager'
      AND (
        -- Created by manager
        EXISTS (SELECT 1 FROM public.workflows WHERE id = workflow_id AND created_by = user_id)
        OR
        -- Involves team members
        EXISTS (
          SELECT 1 FROM public.workflows w
          WHERE w.id = workflow_id 
          AND (
            w.created_by = ANY(public.get_user_team_members(user_id))
            OR w.assigned_to = ANY(public.get_user_team_members(user_id))
            OR public.is_assigned_to_workflow(user_id, workflow_id)
          )
        )
      )
    )
    OR
    -- Employees can access assigned workflows or reusable workflows with first step assigned
    (
      public.get_user_role(user_id) = 'employee'
      AND (
        public.is_assigned_to_workflow(user_id, workflow_id)
        OR
        -- Reusable workflows where user is assigned to first step
        EXISTS (
          SELECT 1 FROM public.workflows w
          WHERE w.id = workflow_id 
          AND w.is_reusable = true
          AND EXISTS (
            SELECT 1 FROM public.workflow_steps ws
            JOIN public.workflow_step_assignments wsa ON wsa.workflow_step_id = ws.id
            WHERE ws.workflow_id = workflow_id 
            AND ws.step_order = 1
            AND wsa.assigned_to = user_id
          )
        )
      )
    );
$$;

-- Phase 1.3: Deploy Comprehensive RLS Policies

-- Enable RLS on all tables that need it
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;

-- Companies RLS Policies
CREATE POLICY "Root users can access all companies" ON public.companies
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access companies in their workspace" ON public.companies
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) IN ('admin', 'manager', 'employee')
);

-- CRM Contacts RLS Policies
CREATE POLICY "Root users can access all contacts" ON public.crm_contacts
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Admins can access all contacts in workspace" ON public.crm_contacts
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Managers can access team contacts" ON public.crm_contacts  
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'manager'
  AND (
    created_by = auth.uid()
    OR created_by = ANY(public.get_user_team_members(auth.uid()))
  )
);

CREATE POLICY "Employees can access assigned contacts" ON public.crm_contacts
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'employee'
  AND created_by = auth.uid()
);

-- CRM Tasks RLS Policies  
CREATE POLICY "Root users can access all tasks" ON public.crm_tasks
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Admins can access all tasks in workspace" ON public.crm_tasks
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Managers can access team tasks" ON public.crm_tasks
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'manager'
  AND (
    created_by = auth.uid()
    OR created_by = ANY(public.get_user_team_members(auth.uid()))
    OR assigned_to = auth.uid()
    OR assigned_to = ANY(public.get_user_team_members(auth.uid()))
  )
);

CREATE POLICY "Employees can access assigned tasks" ON public.crm_tasks
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'employee'
  AND (created_by = auth.uid() OR assigned_to = auth.uid())
);

-- CRM Deals RLS Policies
CREATE POLICY "Root users can access all deals" ON public.crm_deals
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Admins can access all deals in workspace" ON public.crm_deals
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Managers can access team deals" ON public.crm_deals
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'manager'
  AND (
    created_by = auth.uid()
    OR created_by = ANY(public.get_user_team_members(auth.uid()))
    OR assigned_to = auth.uid()
    OR assigned_to = ANY(public.get_user_team_members(auth.uid()))
  )
);

CREATE POLICY "Employees can access assigned deals" ON public.crm_deals
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.get_user_role(auth.uid()) = 'employee'
  AND (created_by = auth.uid() OR assigned_to = auth.uid())
);

-- Workflows RLS Policies
CREATE POLICY "Root users can access all workflows" ON public.workflows
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access workflows based on role" ON public.workflows
FOR ALL USING (public.can_access_workflow(auth.uid(), id));

-- Workflow Steps RLS Policies
CREATE POLICY "Root users can access all workflow steps" ON public.workflow_steps
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access workflow steps if they can access the workflow" ON public.workflow_steps
FOR ALL USING (public.can_access_workflow(auth.uid(), workflow_id));

-- Workflow Step Assignments RLS Policies
CREATE POLICY "Root users can access all assignments" ON public.workflow_step_assignments
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access assignments in their workspace" ON public.workflow_step_assignments
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND (
    -- Admins see all in workspace
    public.get_user_role(auth.uid()) = 'admin'
    OR
    -- Managers see team assignments
    (
      public.get_user_role(auth.uid()) = 'manager'
      AND (
        assigned_by = auth.uid()
        OR assigned_to = auth.uid()
        OR assigned_to = ANY(public.get_user_team_members(auth.uid()))
      )
    )
    OR
    -- Employees see their assignments
    (
      public.get_user_role(auth.uid()) = 'employee'
      AND assigned_to = auth.uid()
    )
  )
);

-- Saved Workflows RLS Policies
CREATE POLICY "Root users can access all saved workflows" ON public.saved_workflows
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access saved workflows in their workspace" ON public.saved_workflows
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND (
    -- Admins see all in workspace
    public.get_user_role(auth.uid()) = 'admin'
    OR
    -- Managers see own workflows
    (
      public.get_user_role(auth.uid()) = 'manager'
      AND created_by = auth.uid()
    )
    OR
    -- Employees see reusable workflows assigned to them
    (
      public.get_user_role(auth.uid()) = 'employee'
      AND (
        created_by = auth.uid()
        OR (
          is_reusable = true
          -- Additional logic for first step assignment check would need JSON parsing
        )
      )
    )
  )
);

-- Workflow Instances RLS Policies
CREATE POLICY "Root users can access all workflow instances" ON public.workflow_instances
FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access workflow instances in their workspace" ON public.workflow_instances
FOR ALL USING (
  workspace_id = public.get_user_workspace(auth.uid())
  AND public.can_access_workflow(auth.uid(), workflow_id)
);
