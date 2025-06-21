
-- Ensure all existing workspaces have NeuraCore enabled
INSERT INTO public.workspace_modules (workspace_id, module_id, is_active, activated_at, activated_by)
SELECT 
  w.id as workspace_id,
  m.id as module_id,
  true as is_active,
  now() as activated_at,
  w.owner_id as activated_by
FROM public.workspaces w
CROSS JOIN public.modules m
WHERE m.name = 'neura-core'
  AND NOT EXISTS (
    SELECT 1 FROM public.workspace_modules wm 
    WHERE wm.workspace_id = w.id AND wm.module_id = m.id
  );

-- Update existing workspace_modules records to ensure NeuraCore is active
UPDATE public.workspace_modules 
SET is_active = true, activated_at = COALESCE(activated_at, now())
FROM public.modules m
WHERE workspace_modules.module_id = m.id 
  AND m.name = 'neura-core' 
  AND workspace_modules.is_active = false;

-- Create function to automatically enable NeuraCore for new workspaces
CREATE OR REPLACE FUNCTION public.enable_neura_core_for_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  neura_core_module_id UUID;
BEGIN
  -- Get NeuraCore module ID
  SELECT id INTO neura_core_module_id
  FROM public.modules
  WHERE name = 'neura-core';
  
  -- Enable NeuraCore for the new workspace
  IF neura_core_module_id IS NOT NULL THEN
    INSERT INTO public.workspace_modules (workspace_id, module_id, is_active, activated_at, activated_by)
    VALUES (NEW.id, neura_core_module_id, true, now(), NEW.owner_id)
    ON CONFLICT (workspace_id, module_id) DO UPDATE SET
      is_active = true,
      activated_at = COALESCE(workspace_modules.activated_at, now());
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-enable NeuraCore for new workspaces
DROP TRIGGER IF EXISTS auto_enable_neura_core ON public.workspaces;
CREATE TRIGGER auto_enable_neura_core
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.enable_neura_core_for_new_workspace();

-- Create function to prevent NeuraCore deactivation if other modules depend on it
CREATE OR REPLACE FUNCTION public.prevent_neura_core_deactivation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  module_name_val TEXT;
  dependent_count INTEGER;
BEGIN
  -- Get module name
  SELECT name INTO module_name_val 
  FROM public.modules 
  WHERE id = NEW.module_id;
  
  -- Check if this is NeuraCore being deactivated
  IF module_name_val = 'neura-core' AND NEW.is_active = false THEN
    -- Count active modules that depend on NeuraCore
    SELECT COUNT(*) INTO dependent_count
    FROM public.workspace_modules wm
    JOIN public.modules m ON m.id = wm.module_id
    WHERE wm.workspace_id = NEW.workspace_id
      AND wm.is_active = true
      AND 'neura-core' = ANY(m.required_modules)
      AND m.name != 'neura-core';
    
    -- Prevent deactivation if there are dependent modules
    IF dependent_count > 0 THEN
      RAISE EXCEPTION 'Cannot deactivate NeuraCore while other modules depend on it. Deactivate dependent modules first.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent NeuraCore deactivation
DROP TRIGGER IF EXISTS prevent_neura_core_deactivation ON public.workspace_modules;
CREATE TRIGGER prevent_neura_core_deactivation
  BEFORE UPDATE ON public.workspace_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_neura_core_deactivation();

-- Update get_module_access_info function to ensure NeuraCore is always treated as active
CREATE OR REPLACE FUNCTION public.get_module_access_info(
  p_workspace_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  module_name TEXT,
  display_name TEXT,
  is_active BOOLEAN,
  is_available BOOLEAN,
  has_dependencies BOOLEAN,
  missing_dependencies TEXT[],
  version TEXT,
  settings JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.name::TEXT,
    m.display_name::TEXT,
    -- NeuraCore is always considered active, others use their actual status
    CASE 
      WHEN m.name = 'neura-core' THEN true
      ELSE COALESCE(wm.is_active, false)
    END::BOOLEAN,
    -- NeuraCore is always available, others based on core status or activation
    CASE 
      WHEN m.name = 'neura-core' THEN true
      ELSE (m.is_core OR COALESCE(wm.is_active, false))
    END::BOOLEAN,
    public.check_module_dependencies(p_workspace_id, m.name)::BOOLEAN,
    CASE 
      WHEN NOT public.check_module_dependencies(p_workspace_id, m.name) THEN
        ARRAY(
          SELECT unnest(m.required_modules) 
          EXCEPT 
          SELECT m2.name 
          FROM public.workspace_modules wm2
          JOIN public.modules m2 ON m2.id = wm2.module_id
          WHERE wm2.workspace_id = p_workspace_id AND wm2.is_active = true
        )
      ELSE '{}'::TEXT[]
    END,
    COALESCE(wm.version, m.version)::TEXT,
    COALESCE(wm.settings, '{}'::jsonb)::JSONB
  FROM public.modules m
  LEFT JOIN public.workspace_modules wm ON wm.module_id = m.id AND wm.workspace_id = p_workspace_id
  ORDER BY m.is_core DESC, m.display_name;
END;
$$;
