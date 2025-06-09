
-- Add a function to check if a user is a root user
CREATE OR REPLACE FUNCTION public.is_root_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id
      AND role = 'root'
  );
$function$;

-- Update the first user to be root (assuming tarek.hawasli@gmail.com is the first user)
UPDATE public.profiles 
SET role = 'root' 
WHERE email = 'tarek.hawasli@gmail.com';

-- Add a trigger to prevent deletion of root users at database level
CREATE OR REPLACE FUNCTION public.prevent_root_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF OLD.role = 'root' THEN
    RAISE EXCEPTION 'Root users cannot be deleted';
  END IF;
  RETURN OLD;
END;
$function$;

CREATE TRIGGER prevent_root_deletion
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_root_user_deletion();

-- Also prevent role changes from root to other roles unless done by another root
CREATE OR REPLACE FUNCTION public.protect_root_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_role user_role;
BEGIN
  -- If changing FROM root role, ensure current user is also root
  IF OLD.role = 'root' AND NEW.role != 'root' THEN
    SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
    IF current_user_role != 'root' THEN
      RAISE EXCEPTION 'Only root users can change root user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER protect_root_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.protect_root_role_changes();
