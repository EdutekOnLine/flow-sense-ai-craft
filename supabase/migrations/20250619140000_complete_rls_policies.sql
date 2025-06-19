
-- Complete RLS policies for all remaining workflow-related tables

-- Workflow steps RLS policies
DROP POLICY IF EXISTS "Users can view workflow steps for accessible workflows" ON public.workflow_steps;
DROP POLICY IF EXISTS "Users can manage workflow steps for their workflows" ON public.workflow_steps;

CREATE POLICY "Users can view workflow steps for accessible workflows" ON public.workflow_steps
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    EXISTS (
      SELECT 1 FROM public.workflows w 
      WHERE w.id = workflow_id AND (
        w.created_by = auth.uid() OR 
        w.assigned_to = auth.uid() OR 
        public.has_workflow_permissions(auth.uid())
      )
    )
  );

CREATE POLICY "Users can manage workflow steps for their workflows" ON public.workflow_steps
  FOR ALL USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (
      EXISTS (
        SELECT 1 FROM public.workflows w 
        WHERE w.id = workflow_id AND w.created_by = auth.uid()
      ) OR
      public.has_workflow_permissions(auth.uid())
    )
  );

-- Workflow instances RLS policies
DROP POLICY IF EXISTS "Users can view workflow instances for accessible workflows" ON public.workflow_instances;
DROP POLICY IF EXISTS "Users can create workflow instances" ON public.workflow_instances;
DROP POLICY IF EXISTS "Users can update workflow instances they started or have permissions" ON public.workflow_instances;

CREATE POLICY "Users can view workflow instances for accessible workflows" ON public.workflow_instances
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (
      started_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.workflows w 
        WHERE w.id = workflow_id AND (
          w.created_by = auth.uid() OR 
          w.assigned_to = auth.uid() OR 
          public.has_workflow_permissions(auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can create workflow instances" ON public.workflow_instances
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    started_by = auth.uid()
  );

CREATE POLICY "Users can update workflow instances they started or have permissions" ON public.workflow_instances
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (started_by = auth.uid() OR public.has_workflow_permissions(auth.uid()))
  );

-- Workflow step assignments RLS policies
DROP POLICY IF EXISTS "Users can view assignments for accessible workflows" ON public.workflow_step_assignments;
DROP POLICY IF EXISTS "Users can create assignments if they have permissions" ON public.workflow_step_assignments;
DROP POLICY IF EXISTS "Users can update their assignments or if they have permissions" ON public.workflow_step_assignments;

CREATE POLICY "Users can view assignments for accessible workflows" ON public.workflow_step_assignments
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (
      assigned_to = auth.uid() OR
      assigned_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.workflow_steps ws
        JOIN public.workflows w ON w.id = ws.workflow_id
        WHERE ws.id = workflow_step_id AND (
          w.created_by = auth.uid() OR public.has_workflow_permissions(auth.uid())
        )
      )
    )
  );

CREATE POLICY "Users can create assignments if they have permissions" ON public.workflow_step_assignments
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    public.has_workflow_permissions(auth.uid()) AND
    assigned_by = auth.uid()
  );

CREATE POLICY "Users can update their assignments or if they have permissions" ON public.workflow_step_assignments
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (assigned_to = auth.uid() OR public.has_workflow_permissions(auth.uid()))
  );

-- Workflow comments RLS policies
DROP POLICY IF EXISTS "Users can view comments for accessible workflows" ON public.workflow_comments;
DROP POLICY IF EXISTS "Users can create comments on accessible workflows" ON public.workflow_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.workflow_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.workflow_comments;

CREATE POLICY "Users can view comments for accessible workflows" ON public.workflow_comments
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    EXISTS (
      SELECT 1 FROM public.workflows w 
      WHERE w.id = workflow_id AND (
        w.created_by = auth.uid() OR 
        w.assigned_to = auth.uid() OR 
        public.has_workflow_permissions(auth.uid())
      )
    )
  );

CREATE POLICY "Users can create comments on accessible workflows" ON public.workflow_comments
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.workflows w 
      WHERE w.id = workflow_id AND (
        w.created_by = auth.uid() OR 
        w.assigned_to = auth.uid() OR 
        public.has_workflow_permissions(auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON public.workflow_comments
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own comments" ON public.workflow_comments
  FOR DELETE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    user_id = auth.uid()
  );

-- Saved workflows RLS policies
DROP POLICY IF EXISTS "Users can view saved workflows in their workspace" ON public.saved_workflows;
DROP POLICY IF EXISTS "Users can create saved workflows" ON public.saved_workflows;
DROP POLICY IF EXISTS "Users can update their saved workflows" ON public.saved_workflows;
DROP POLICY IF EXISTS "Users can delete their saved workflows" ON public.saved_workflows;

CREATE POLICY "Users can view saved workflows in their workspace" ON public.saved_workflows
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    public.can_user_access_workspace(auth.uid(), 
      (SELECT workspace_id FROM public.profiles WHERE id = created_by)
    )
  );

CREATE POLICY "Users can create saved workflows" ON public.saved_workflows
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their saved workflows" ON public.saved_workflows
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their saved workflows" ON public.saved_workflows
  FOR DELETE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

-- Workflow definitions RLS policies
DROP POLICY IF EXISTS "Users can view workflow definitions in their workspace" ON public.workflow_definitions;
DROP POLICY IF EXISTS "Users can create workflow definitions" ON public.workflow_definitions;
DROP POLICY IF EXISTS "Users can update their workflow definitions" ON public.workflow_definitions;
DROP POLICY IF EXISTS "Users can delete their workflow definitions" ON public.workflow_definitions;

CREATE POLICY "Users can view workflow definitions in their workspace" ON public.workflow_definitions
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    public.can_user_access_workspace(auth.uid(), 
      (SELECT workspace_id FROM public.profiles WHERE id = created_by)
    )
  );

CREATE POLICY "Users can create workflow definitions" ON public.workflow_definitions
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their workflow definitions" ON public.workflow_definitions
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their workflow definitions" ON public.workflow_definitions
  FOR DELETE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

-- Workflow templates RLS policies
DROP POLICY IF EXISTS "Users can view public templates and their own" ON public.workflow_templates;
DROP POLICY IF EXISTS "Users can create workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Users can update their workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Users can delete their workflow templates" ON public.workflow_templates;

CREATE POLICY "Users can view public templates and their own" ON public.workflow_templates
  FOR SELECT USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    (is_public = true OR created_by = auth.uid())
  );

CREATE POLICY "Users can create workflow templates" ON public.workflow_templates
  FOR INSERT WITH CHECK (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their workflow templates" ON public.workflow_templates
  FOR UPDATE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can delete their workflow templates" ON public.workflow_templates
  FOR DELETE USING (
    public.can_access_module_data(auth.uid(), 'neura-flow') AND
    created_by = auth.uid()
  );

-- Module audit logs RLS policies
DROP POLICY IF EXISTS "Admins can view module audit logs for their workspace" ON public.module_audit_logs;

CREATE POLICY "Admins can view module audit logs for their workspace" ON public.module_audit_logs
  FOR SELECT USING (
    public.is_workspace_admin(auth.uid()) AND
    public.can_user_access_workspace(auth.uid(), workspace_id)
  );

-- User invitations RLS policies
DROP POLICY IF EXISTS "Admins can manage user invitations for their workspace" ON public.user_invitations;

CREATE POLICY "Admins can manage user invitations for their workspace" ON public.user_invitations
  FOR ALL USING (
    public.is_workspace_admin(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = invited_by AND p.id = auth.uid()
    )
  );

-- User presence RLS policies
DROP POLICY IF EXISTS "Users can view presence in their workspace" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON public.user_presence;

CREATE POLICY "Users can view presence in their workspace" ON public.user_presence
  FOR SELECT USING (
    public.can_user_access_workspace(auth.uid(), 
      (SELECT workspace_id FROM public.profiles WHERE id = user_id)
    )
  );

CREATE POLICY "Users can update their own presence" ON public.user_presence
  FOR ALL USING (user_id = auth.uid());

