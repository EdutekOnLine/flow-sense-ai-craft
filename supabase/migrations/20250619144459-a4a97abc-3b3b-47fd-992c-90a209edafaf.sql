
-- Create function to get full module dependency tree with hierarchy levels
CREATE OR REPLACE FUNCTION public.get_module_dependency_tree(
  p_workspace_id UUID,
  p_module_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  module_name TEXT,
  display_name TEXT,
  level INTEGER,
  is_active BOOLEAN,
  depends_on TEXT[],
  dependents TEXT[],
  path TEXT[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE dependency_tree AS (
    -- Base case: start with specified module or all modules
    SELECT 
      m.name::TEXT as module_name,
      m.display_name::TEXT as display_name,
      0 as level,
      COALESCE(wm.is_active, false) as is_active,
      m.required_modules as depends_on,
      ARRAY[]::TEXT[] as dependents,
      ARRAY[m.name] as path
    FROM public.modules m
    LEFT JOIN public.workspace_modules wm ON wm.module_id = m.id AND wm.workspace_id = p_workspace_id
    WHERE p_module_name IS NULL OR m.name = p_module_name
    
    UNION ALL
    
    -- Recursive case: find dependencies
    SELECT 
      req_m.name::TEXT,
      req_m.display_name::TEXT,
      dt.level + 1,
      COALESCE(req_wm.is_active, false),
      req_m.required_modules,
      array_append(dt.dependents, dt.module_name),
      array_append(dt.path, req_m.name)
    FROM dependency_tree dt
    CROSS JOIN unnest(dt.depends_on) AS required_module
    JOIN public.modules req_m ON req_m.name = required_module
    LEFT JOIN public.workspace_modules req_wm ON req_wm.module_id = req_m.id AND req_wm.workspace_id = p_workspace_id
    WHERE NOT (req_m.name = ANY(dt.path)) -- Prevent circular dependencies
  )
  SELECT DISTINCT
    dt.module_name,
    dt.display_name,
    dt.level,
    dt.is_active,
    dt.depends_on,
    dt.dependents,
    dt.path
  FROM dependency_tree dt
  ORDER BY dt.level, dt.module_name;
END;
$$;

-- Create function to resolve optimal activation order
CREATE OR REPLACE FUNCTION public.resolve_activation_order(
  p_workspace_id UUID,
  p_modules_to_activate TEXT[]
)
RETURNS TABLE(
  activation_order INTEGER,
  module_name TEXT,
  display_name TEXT,
  reason TEXT,
  is_required BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  module_record RECORD;
  required_modules TEXT[];
  all_required TEXT[] := '{}';
  processed_modules TEXT[] := '{}';
  current_order INTEGER := 1;
BEGIN
  -- First, collect all required modules recursively
  FOR module_record IN 
    SELECT DISTINCT dt.module_name, dt.display_name, dt.depends_on
    FROM public.get_module_dependency_tree(p_workspace_id) dt
    WHERE dt.module_name = ANY(p_modules_to_activate)
  LOOP
    all_required := array_cat(all_required, module_record.depends_on);
  END LOOP;
  
  -- Remove duplicates and add original modules
  all_required := array_cat(all_required, p_modules_to_activate);
  SELECT array_agg(DISTINCT module) INTO all_required FROM unnest(all_required) AS module;
  
  -- Return modules in dependency order
  WHILE array_length(all_required, 1) > 0 LOOP
    FOR module_record IN
      SELECT m.name, m.display_name, m.required_modules
      FROM public.modules m
      WHERE m.name = ANY(all_required)
        AND NOT (m.name = ANY(processed_modules))
        AND (
          array_length(m.required_modules, 1) IS NULL 
          OR m.required_modules <@ processed_modules
        )
      ORDER BY array_length(m.required_modules, 1) NULLS FIRST, m.name
    LOOP
      RETURN QUERY SELECT 
        current_order,
        module_record.name::TEXT,
        module_record.display_name::TEXT,
        CASE 
          WHEN module_record.name = ANY(p_modules_to_activate) THEN 'Requested module'
          ELSE 'Required dependency'
        END::TEXT,
        NOT (module_record.name = ANY(p_modules_to_activate));
      
      processed_modules := array_append(processed_modules, module_record.name);
      current_order := current_order + 1;
    END LOOP;
    
    -- Remove processed modules from remaining list
    SELECT array_agg(module) INTO all_required 
    FROM unnest(all_required) AS module 
    WHERE NOT (module = ANY(processed_modules));
    
    -- Break if no progress (circular dependency or other issue)
    IF array_length(all_required, 1) IS NOT NULL AND current_order > 20 THEN
      EXIT;
    END IF;
  END LOOP;
END;
$$;

-- Create function to get dependency conflicts
CREATE OR REPLACE FUNCTION public.get_dependency_conflicts(
  p_workspace_id UUID,
  p_modules_to_deactivate TEXT[]
)
RETURNS TABLE(
  affected_module TEXT,
  display_name TEXT,
  conflict_type TEXT,
  impact_level INTEGER,
  suggested_action TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH active_modules AS (
    SELECT m.name, m.display_name, m.required_modules
    FROM public.modules m
    JOIN public.workspace_modules wm ON wm.module_id = m.id
    WHERE wm.workspace_id = p_workspace_id AND wm.is_active = true
  ),
  conflicts AS (
    SELECT 
      am.name as affected_module,
      am.display_name,
      'DEPENDENCY_BROKEN' as conflict_type,
      1 as impact_level,
      'Deactivate ' || am.name || ' first or keep ' || dep || ' active' as suggested_action
    FROM active_modules am
    CROSS JOIN unnest(am.required_modules) AS dep
    WHERE dep = ANY(p_modules_to_deactivate)
      AND NOT (am.name = ANY(p_modules_to_deactivate))
  )
  SELECT * FROM conflicts
  ORDER BY impact_level DESC, affected_module;
END;
$$;

-- Create function to validate module configuration
CREATE OR REPLACE FUNCTION public.validate_module_configuration(
  p_workspace_id UUID,
  p_module_name TEXT,
  p_settings JSONB
)
RETURNS TABLE(
  is_valid BOOLEAN,
  validation_errors TEXT[],
  warnings TEXT[]
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  module_schema JSONB;
  error_messages TEXT[] := '{}';
  warning_messages TEXT[] := '{}';
  setting_key TEXT;
  setting_value JSONB;
  schema_def JSONB;
BEGIN
  -- Get module settings schema
  SELECT settings_schema INTO module_schema
  FROM public.modules
  WHERE name = p_module_name;
  
  -- Validate each setting against schema
  FOR setting_key, setting_value IN SELECT * FROM jsonb_each(p_settings) LOOP
    -- Check if setting exists in schema
    IF NOT (module_schema ? setting_key) THEN
      error_messages := array_append(error_messages, 'Unknown setting: ' || setting_key);
      CONTINUE;
    END IF;
    
    -- Get schema definition for this setting
    schema_def := module_schema -> setting_key;
    
    -- Type validation (basic)
    IF (schema_def ->> 'type') = 'number' AND NOT (jsonb_typeof(setting_value) = 'number') THEN
      error_messages := array_append(error_messages, setting_key || ' must be a number');
    ELSIF (schema_def ->> 'type') = 'boolean' AND NOT (jsonb_typeof(setting_value) = 'boolean') THEN
      error_messages := array_append(error_messages, setting_key || ' must be a boolean');
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    array_length(error_messages, 1) IS NULL OR array_length(error_messages, 1) = 0,
    error_messages,
    warning_messages;
END;
$$;
