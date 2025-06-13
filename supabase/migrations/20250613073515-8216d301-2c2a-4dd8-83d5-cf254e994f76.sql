
-- Enable Row Level Security on user_invitations table
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins and root users to INSERT invitations
CREATE POLICY "Admins and root users can create invitations" 
  ON public.user_invitations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'root')
    )
  );

-- Create policy to allow admins and root users to SELECT invitations
CREATE POLICY "Admins and root users can view invitations" 
  ON public.user_invitations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'root')
    )
  );

-- Create policy to allow admins and root users to UPDATE invitations
CREATE POLICY "Admins and root users can update invitations" 
  ON public.user_invitations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'root')
    )
  );

-- Create policy to allow admins and root users to DELETE invitations
CREATE POLICY "Admins and root users can delete invitations" 
  ON public.user_invitations 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'root')
    )
  );
