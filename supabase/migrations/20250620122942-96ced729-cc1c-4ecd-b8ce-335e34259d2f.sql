
-- Add workspace_id to user_invitations table to track which workspace the invitation is for
ALTER TABLE public.user_invitations 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Update the handle_new_user function to assign users to the correct workspace based on invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Check if there's a valid invitation for this email
  SELECT * INTO invitation_record 
  FROM public.user_invitations 
  WHERE email = NEW.email 
    AND used_at IS NULL 
    AND expires_at > NOW()
  LIMIT 1;
  
  -- If no valid invitation found, prevent user creation (except for the first admin)
  IF invitation_record IS NULL THEN
    -- Check if this is the first user (who will be the admin)
    IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
      -- This is the first user, make them admin
      INSERT INTO public.profiles (id, email, first_name, last_name, role)
      VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        'admin'
      );
    ELSE
      -- Not the first user and no invitation, raise exception
      RAISE EXCEPTION 'User registration requires a valid invitation from an administrator';
    END IF;
  ELSE
    -- Valid invitation found, create profile with invited role and workspace
    INSERT INTO public.profiles (id, email, first_name, last_name, role, department, workspace_id)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      invitation_record.role,
      invitation_record.department,
      invitation_record.workspace_id
    );
    
    -- Mark invitation as used
    UPDATE public.user_invitations 
    SET used_at = NOW() 
    WHERE id = invitation_record.id;
  END IF;
  
  RETURN NEW;
END;
$$;
