
-- Fix all RLS policy bugs for team management
DROP POLICY IF EXISTS "Admins and root users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Admins and managers can update their teams" ON public.teams;

-- Fixed INSERT policy - allows both admin and root users with proper manager validation
CREATE POLICY "Admins and root users can create teams" ON public.teams
  FOR INSERT WITH CHECK (
    -- Root users can create teams in any workspace
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'root'
      AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = manager_id AND p.workspace_id = teams.workspace_id
      )
    )
    OR
    -- Admin users can only create teams in their own workspace
    (
      workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
      AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
      AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = manager_id AND p.workspace_id = teams.workspace_id
      )
    )
  );

-- Fixed UPDATE policy - corrects manager workspace validation
CREATE POLICY "Admins and managers can update their teams" ON public.teams
  FOR UPDATE USING (
    workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
      OR manager_id = auth.uid()
    )
  ) WITH CHECK (
    -- Ensure updated manager belongs to same workspace as the team
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = manager_id AND p.workspace_id = teams.workspace_id
    )
  );
