
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins and managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create comprehensive RLS policies for user management

-- 1. SELECT policies
CREATE POLICY "Root users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root'
    )
  );

CREATE POLICY "Admin users can view all profiles except other admins and root" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) AND (role NOT IN ('admin', 'root') OR id = auth.uid())
  );

CREATE POLICY "Manager users can view non-root profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'manager'
    ) AND (role != 'root' OR id = auth.uid())
  );

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- 2. UPDATE policies
CREATE POLICY "Root users can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root'
    )
  );

CREATE POLICY "Admin users can update non-root profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) AND (role != 'root')
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 3. INSERT policies (for new user creation)
CREATE POLICY "Root and admin users can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('root', 'admin')
    )
  );

-- 4. DELETE policies (handled by existing trigger for root users)
CREATE POLICY "Root users can delete non-root profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root'
    ) AND role != 'root'
  );

CREATE POLICY "Admin users can delete employee and manager profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) AND role IN ('employee', 'manager')
  );
