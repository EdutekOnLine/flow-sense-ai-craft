
-- Drop all the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Root users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles except other admins and root" ON public.profiles;
DROP POLICY IF EXISTS "Manager users can view non-root profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Root users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update non-root profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Root and admin users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Root users can delete non-root profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can delete employee and manager profiles" ON public.profiles;

-- Create security definer functions to safely check user roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_user_role(user_id uuid, target_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = target_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.user_has_role_in(user_id uuid, roles user_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = ANY(roles)
  );
$function$;

-- Recreate RLS policies using security definer functions to prevent recursion

-- SELECT policies
CREATE POLICY "Root users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_user_role(auth.uid(), 'root'));

CREATE POLICY "Admin users can view non-admin and non-root profiles or themselves" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.is_user_role(auth.uid(), 'admin') 
    AND (role NOT IN ('admin', 'root') OR id = auth.uid())
  );

CREATE POLICY "Manager users can view non-root profiles or themselves" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.is_user_role(auth.uid(), 'manager') 
    AND (role != 'root' OR id = auth.uid())
  );

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- UPDATE policies
CREATE POLICY "Root users can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_user_role(auth.uid(), 'root'));

CREATE POLICY "Admin users can update non-root profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    public.is_user_role(auth.uid(), 'admin') 
    AND role != 'root'
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- INSERT policies
CREATE POLICY "Root and admin users can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.user_has_role_in(auth.uid(), ARRAY['root', 'admin']::user_role[]));

-- DELETE policies
CREATE POLICY "Root users can delete non-root profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    public.is_user_role(auth.uid(), 'root') 
    AND role != 'root'
  );

CREATE POLICY "Admin users can delete employee and manager profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (
    public.is_user_role(auth.uid(), 'admin') 
    AND role IN ('employee', 'manager')
  );
