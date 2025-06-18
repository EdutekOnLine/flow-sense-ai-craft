
-- Add missing columns to existing tables
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS required_modules TEXT[] DEFAULT '{}';

ALTER TABLE public.workspace_modules 
ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0.0';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspace_modules_workspace_id ON public.workspace_modules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_modules_module_id ON public.workspace_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_workspace_modules_active ON public.workspace_modules(workspace_id, is_active);

-- Update existing modules with required_modules and enhanced settings_schema
UPDATE public.modules SET 
  required_modules = '{}',
  settings_schema = '{}'
WHERE name = 'neura-core';

UPDATE public.modules SET 
  required_modules = '{"neura-core"}',
  settings_schema = '{"max_workflows": {"type": "number", "default": 100, "label": "Maximum Workflows"}, "auto_assign": {"type": "boolean", "default": true, "label": "Auto-assign Tasks"}}'
WHERE name = 'neura-flow';

UPDATE public.modules SET 
  required_modules = '{"neura-core"}',
  settings_schema = '{"max_contacts": {"type": "number", "default": 1000, "label": "Maximum Contacts"}, "enable_notifications": {"type": "boolean", "default": true, "label": "Enable Notifications"}}'
WHERE name = 'neura-crm';

UPDATE public.modules SET 
  required_modules = '{"neura-core"}',
  settings_schema = '{"max_forms": {"type": "number", "default": 50, "label": "Maximum Forms"}, "allow_anonymous": {"type": "boolean", "default": false, "label": "Allow Anonymous Submissions"}}'
WHERE name = 'neura-forms';

UPDATE public.modules SET 
  required_modules = '{"neura-core"}',
  settings_schema = '{"max_courses": {"type": "number", "default": 25, "label": "Maximum Courses"}, "enable_certificates": {"type": "boolean", "default": true, "label": "Enable Certificates"}}'
WHERE name = 'neura-edu';

-- Create function to check module dependencies
CREATE OR REPLACE FUNCTION public.check_module_dependencies(
  p_workspace_id UUID,
  p_module_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  required_modules TEXT[];
  required_module TEXT;
BEGIN
  -- Get required modules for the given module
  SELECT m.required_modules INTO required_modules
  FROM public.modules m
  WHERE m.name = p_module_name;
  
  -- If no required modules, return true
  IF required_modules IS NULL OR array_length(required_modules, 1) IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if all required modules are active in the workspace
  FOREACH required_module IN ARRAY required_modules
  LOOP
    IF NOT EXISTS (
      SELECT 1 
      FROM public.workspace_modules wm
      JOIN public.modules m ON m.id = wm.module_id
      WHERE wm.workspace_id = p_workspace_id
        AND m.name = required_module
        AND wm.is_active = true
    ) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Create function to get module access info
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
    COALESCE(wm.is_active, false)::BOOLEAN,
    (m.is_core OR COALESCE(wm.is_active, false))::BOOLEAN,
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
