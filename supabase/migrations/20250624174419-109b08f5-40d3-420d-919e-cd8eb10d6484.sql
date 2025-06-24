
-- Debug and fix RLS policy for team creation
-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Admins and root users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Admins and managers can update their teams" ON public.teams;

-- Create helper functions to avoid RLS recursion and improve clarity
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_workspace(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT workspace_id FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.validate_manager_in_workspace(manager_id uuid, target_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = manager_id AND p.workspace_id = target_workspace_id
  );
$$;

-- Fixed INSERT policy using proper column references and helper functions
CREATE POLICY "Admins and root users can create teams" ON public.teams
  FOR INSERT WITH CHECK (
    -- Root users can create teams in any workspace (with valid manager)
    (
      public.get_user_role(auth.uid()) = 'root'
      AND public.validate_manager_in_workspace(manager_id, workspace_id)
    )
    OR
    -- Admin users can only create teams in their own workspace (with valid manager)
    (
      public.get_user_role(auth.uid()) IN ('admin')
      AND workspace_id = public.get_user_workspace(auth.uid())
      AND public.validate_manager_in_workspace(manager_id, workspace_id)
    )
  );

-- Fixed UPDATE policy using helper functions
CREATE POLICY "Admins and managers can update their teams" ON public.teams
  FOR UPDATE USING (
    workspace_id = public.get_user_workspace(auth.uid())
    AND (
      public.get_user_role(auth.uid()) IN ('admin', 'root')
      OR manager_id = auth.uid()
    )
  ) WITH CHECK (
    -- Ensure updated manager belongs to same workspace as the team
    public.validate_manager_in_workspace(manager_id, workspace_id)
  );
