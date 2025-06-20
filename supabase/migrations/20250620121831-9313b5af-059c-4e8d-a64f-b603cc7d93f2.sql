
-- Create the "Testers" workspace
INSERT INTO public.workspaces (name, slug, description, owner_id)
SELECT 
  'Testers',
  'testers',
  'Default workspace for testing users',
  id
FROM public.profiles 
WHERE role = 'root' 
LIMIT 1;

-- Move all non-root users to the "Testers" workspace
UPDATE public.profiles 
SET workspace_id = (
  SELECT id FROM public.workspaces WHERE slug = 'testers' LIMIT 1
)
WHERE role != 'root' AND workspace_id IS NULL;
