
-- Create teams table (without the problematic check constraint)
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure team name is unique within workspace
  UNIQUE(workspace_id, name)
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_team TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate team memberships
  UNIQUE(team_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_teams_workspace_id ON public.teams(workspace_id);
CREATE INDEX idx_teams_manager_id ON public.teams(manager_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Add updated_at trigger for teams
CREATE TRIGGER handle_updated_at_teams BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS on both tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is team manager
CREATE OR REPLACE FUNCTION public.is_team_manager(user_id uuid, target_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = target_team_id AND manager_id = user_id
  );
$$;

-- Create helper function to check if user can access team member data
CREATE OR REPLACE FUNCTION public.can_access_team_member_data(user_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- User can access their own data
    SELECT 1 WHERE target_user_id = user_id
  ) OR EXISTS (
    -- User is manager of a team that contains the target user
    SELECT 1 FROM public.teams t
    JOIN public.team_members tm ON tm.team_id = t.id
    WHERE t.manager_id = user_id AND tm.user_id = target_user_id
  ) OR EXISTS (
    -- User is admin/root in the same workspace
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.workspace_id = p2.workspace_id
    WHERE p1.id = user_id AND p2.id = target_user_id
      AND p1.role IN ('admin', 'root')
  );
$$;

-- RLS Policies for teams table
CREATE POLICY "Users can view teams in their workspace" ON public.teams
  FOR SELECT USING (
    workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can create teams in their workspace" ON public.teams
  FOR INSERT WITH CHECK (
    workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
    -- Ensure manager belongs to same workspace
    AND EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = manager_id AND p.workspace_id = workspace_id
    )
  );

CREATE POLICY "Admins and managers can update their teams" ON public.teams
  FOR UPDATE USING (
    workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
      OR manager_id = auth.uid()
    )
  ) WITH CHECK (
    -- Ensure updated manager belongs to same workspace
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = manager_id AND p.workspace_id = workspace_id
    )
  );

CREATE POLICY "Admins can delete teams in their workspace" ON public.teams
  FOR DELETE USING (
    workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'root')
  );

-- RLS Policies for team_members table
CREATE POLICY "Users can view team members they have access to" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
        AND t.workspace_id = (SELECT workspace_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins and team managers can add team members" ON public.team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE t.id = team_id
        AND t.workspace_id = p.workspace_id
        AND (p.role IN ('admin', 'root') OR t.manager_id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.teams t ON t.id = team_id
      WHERE p.id = user_id AND p.workspace_id = t.workspace_id
    )
  );

CREATE POLICY "Admins and team managers can remove team members" ON public.team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE t.id = team_id
        AND t.workspace_id = p.workspace_id
        AND (p.role IN ('admin', 'root') OR t.manager_id = auth.uid())
    )
  );

-- Enable realtime for teams tables
ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER TABLE public.team_members REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
