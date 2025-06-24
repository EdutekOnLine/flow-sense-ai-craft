
-- Update the INSERT policy for teams table to handle root users properly
DROP POLICY IF EXISTS "Admins can create teams in their workspace" ON public.teams;

CREATE POLICY "Admins and root users can create teams" ON public.teams
  FOR INSERT WITH CHECK (
    -- Root users can create teams in any workspace
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'root'
      AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = manager_id AND p.workspace_id = workspace_id
      )
    )
    OR
    -- Admin users can only create teams in their own workspace
    (
      workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
      AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
      AND EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = manager_id AND p.workspace_id = workspace_id
      )
    )
  );
