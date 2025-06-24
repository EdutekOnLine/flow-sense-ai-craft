
-- Remove the duplicate SELECT policy on team_members table to avoid conflicts
DROP POLICY IF EXISTS "Users can view team members they have access to" ON public.team_members;

-- Create a single, comprehensive SELECT policy for team_members
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT USING (
    -- Root users can see all team members across all workspaces
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Non-root users can see team members for teams in their workspace
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id 
      AND t.workspace_id = public.get_user_workspace(auth.uid())
    )
  );

-- Simplify the INSERT policy for team_members to be clearer
DROP POLICY IF EXISTS "Admins and team managers can add team members" ON public.team_members;

CREATE POLICY "Authorized users can add team members" ON public.team_members
  FOR INSERT WITH CHECK (
    -- Root users can add team members to any team
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Admins and team managers can add members to teams in their workspace
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
      AND (
        -- Team manager can add members
        t.manager_id = auth.uid()
        OR
        -- Workspace admin can add members to teams in their workspace
        (t.workspace_id = public.get_user_workspace(auth.uid()) 
         AND public.get_user_role(auth.uid()) IN ('admin'))
      )
    )
    AND
    -- Ensure the user being added belongs to the same workspace as the team
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.teams t ON t.id = team_members.team_id
      WHERE p.id = team_members.user_id 
      AND p.workspace_id = t.workspace_id
    )
  );

-- Simplify the DELETE policy for team_members
DROP POLICY IF EXISTS "Admins and team managers can remove team members" ON public.team_members;

CREATE POLICY "Authorized users can remove team members" ON public.team_members
  FOR DELETE USING (
    -- Root users can remove team members from any team
    public.get_user_role(auth.uid()) = 'root'
    OR
    -- Admins and team managers can remove members from teams in their workspace
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
      AND (
        -- Team manager can remove members
        t.manager_id = auth.uid()
        OR
        -- Workspace admin can remove members from teams in their workspace
        (t.workspace_id = public.get_user_workspace(auth.uid()) 
         AND public.get_user_role(auth.uid()) IN ('admin'))
      )
    )
  );
