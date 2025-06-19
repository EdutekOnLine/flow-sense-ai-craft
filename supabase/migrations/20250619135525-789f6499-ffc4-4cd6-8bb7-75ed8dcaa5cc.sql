
-- Add audit logging table for module operations
CREATE TABLE IF NOT EXISTS public.module_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'activated', 'deactivated', 'settings_updated'
  performed_by UUID NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.module_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit logs (only admins can view)
CREATE POLICY "Admins can view module audit logs" ON public.module_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('root', 'admin')
    )
  );

-- Add trigger to create audit logs when workspace_modules are modified
CREATE OR REPLACE FUNCTION public.log_module_changes()
RETURNS TRIGGER AS $$
DECLARE
  module_name_val TEXT;
BEGIN
  -- Get module name
  SELECT name INTO module_name_val 
  FROM public.modules 
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);

  -- Log the change
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.module_audit_logs (
      workspace_id, module_name, action, performed_by, new_state
    ) VALUES (
      NEW.workspace_id, 
      module_name_val, 
      CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END,
      NEW.activated_by,
      row_to_json(NEW)::jsonb
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if activation status changed
    IF OLD.is_active != NEW.is_active THEN
      INSERT INTO public.module_audit_logs (
        workspace_id, module_name, action, performed_by, previous_state, new_state
      ) VALUES (
        NEW.workspace_id,
        module_name_val,
        CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END,
        NEW.activated_by,
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS module_changes_audit_trigger ON public.workspace_modules;
CREATE TRIGGER module_changes_audit_trigger
  AFTER INSERT OR UPDATE ON public.workspace_modules
  FOR EACH ROW EXECUTE FUNCTION public.log_module_changes();

-- Function to check if user can access module data
CREATE OR REPLACE FUNCTION public.can_access_module_data(
  p_user_id UUID,
  p_module_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_workspace_id UUID;
BEGIN
  -- Get user's workspace
  SELECT workspace_id INTO user_workspace_id
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Check if module is active in user's workspace
  RETURN EXISTS (
    SELECT 1
    FROM public.workspace_modules wm
    JOIN public.modules m ON m.id = wm.module_id
    WHERE wm.workspace_id = user_workspace_id
      AND m.name = p_module_name
      AND wm.is_active = true
  );
END;
$$;

-- Function to get dependent modules (modules that depend on a given module)
CREATE OR REPLACE FUNCTION public.get_dependent_modules(
  p_workspace_id UUID,
  p_module_name TEXT
)
RETURNS TABLE(
  module_name TEXT,
  display_name TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.name::TEXT,
    m.display_name::TEXT,
    COALESCE(wm.is_active, false)::BOOLEAN
  FROM public.modules m
  LEFT JOIN public.workspace_modules wm ON wm.module_id = m.id AND wm.workspace_id = p_workspace_id
  WHERE p_module_name = ANY(m.required_modules)
  ORDER BY m.display_name;
END;
$$;
