
-- ============================================================================
-- COMPLETE WORKFLOW RBAC SCHEMA - Phase 1 Completion
-- ============================================================================
-- This completes the RBAC schema setup with RLS policies and final touches.

-- ----------------------------------------------------------------------------
-- STEP 1: Create comprehensive RLS policies for all workflow tables
-- ----------------------------------------------------------------------------

-- Enable RLS on all workflow tables if not already enabled
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_step_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view workflows they have access to" ON public.workflows;
DROP POLICY IF EXISTS "Users can create workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can update workflows they created" ON public.workflows;
DROP POLICY IF EXISTS "Users can delete workflows they created" ON public.workflows;

-- Workflows table policies
CREATE POLICY "Root users can access all workflows" ON public.workflows
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can access workflows in their workspace" ON public.workflows
  FOR SELECT USING (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Admins and managers can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'root')
    AND public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Users can update their own workflows or team workflows" ON public.workflows
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR public.get_user_role(auth.uid()) = 'admin'
    OR (public.get_user_role(auth.uid()) = 'manager' AND public.can_manage_team_member(auth.uid(), created_by))
  );

CREATE POLICY "Users can delete their own workflows or admins can delete any" ON public.workflows
  FOR DELETE USING (
    created_by = auth.uid() 
    OR public.get_user_role(auth.uid()) IN ('admin', 'root')
  );

-- Saved workflows table policies
CREATE POLICY "Root users can access all saved workflows" ON public.saved_workflows
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can view saved workflows in their workspace" ON public.saved_workflows
  FOR SELECT USING (
    public.get_user_workspace_id(auth.uid()) = workspace_id
    OR is_reusable = true  -- Public reusable workflows
  );

CREATE POLICY "Users can create saved workflows" ON public.saved_workflows
  FOR INSERT WITH CHECK (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Users can update their own saved workflows" ON public.saved_workflows
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Users can delete their own saved workflows" ON public.saved_workflows
  FOR DELETE USING (
    created_by = auth.uid() 
    OR public.get_user_role(auth.uid()) IN ('admin', 'root')
  );

-- Workflow steps table policies
CREATE POLICY "Root users can access all workflow steps" ON public.workflow_steps
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can view workflow steps in their workspace" ON public.workflow_steps
  FOR SELECT USING (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Admins and managers can manage workflow steps" ON public.workflow_steps
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'root')
    AND public.get_user_workspace_id(auth.uid()) = workspace_id
  );

-- Workflow step assignments table policies
CREATE POLICY "Root users can access all assignments" ON public.workflow_step_assignments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can view assignments in their workspace" ON public.workflow_step_assignments
  FOR SELECT USING (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Users can view their own assignments" ON public.workflow_step_assignments
  FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Users can update their own assignments" ON public.workflow_step_assignments
  FOR UPDATE USING (
    assigned_to = auth.uid()
    OR assigned_by = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Managers and admins can create assignments" ON public.workflow_step_assignments
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'root')
    AND public.get_user_workspace_id(auth.uid()) = workspace_id
  );

-- Workflow instances table policies
CREATE POLICY "Root users can access all workflow instances" ON public.workflow_instances
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can view workflow instances in their workspace" ON public.workflow_instances
  FOR SELECT USING (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Users can create workflow instances" ON public.workflow_instances
  FOR INSERT WITH CHECK (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Users can update workflow instances they started" ON public.workflow_instances
  FOR UPDATE USING (
    started_by = auth.uid() 
    OR public.get_user_role(auth.uid()) IN ('admin', 'manager')
  );

-- Workflow definitions table policies
CREATE POLICY "Root users can access all workflow definitions" ON public.workflow_definitions
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can view workflow definitions in their workspace" ON public.workflow_definitions
  FOR SELECT USING (
    public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Admins and managers can manage workflow definitions" ON public.workflow_definitions
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'root')
    AND public.get_user_workspace_id(auth.uid()) = workspace_id
  );

-- Workflow templates table policies  
CREATE POLICY "Root users can access all workflow templates" ON public.workflow_templates
  FOR ALL USING (public.get_user_role(auth.uid()) = 'root');

CREATE POLICY "Users can view public workflow templates" ON public.workflow_templates
  FOR SELECT USING (
    is_public = true 
    OR public.get_user_workspace_id(auth.uid()) = workspace_id
  );

CREATE POLICY "Admins and managers can manage workflow templates" ON public.workflow_templates
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'manager', 'root')
    AND (workspace_id IS NULL OR public.get_user_workspace_id(auth.uid()) = workspace_id)
  );
