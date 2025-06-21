
-- First, let's move all non-root users from Default Workspace to Testers workspace
UPDATE public.profiles 
SET workspace_id = (
  SELECT id FROM public.workspaces WHERE slug = 'testers' LIMIT 1
)
WHERE role != 'root' 
  AND workspace_id = (
    SELECT id FROM public.workspaces WHERE slug = 'default' LIMIT 1
  );

-- Clean up workspace_modules entries for Default Workspace
DELETE FROM public.workspace_modules 
WHERE workspace_id = (
  SELECT id FROM public.workspaces WHERE slug = 'default' LIMIT 1
);

-- Clean up module_audit_logs entries for Default Workspace
DELETE FROM public.module_audit_logs 
WHERE workspace_id = (
  SELECT id FROM public.workspaces WHERE slug = 'default' LIMIT 1
);

-- Clean up user_invitations for Default Workspace
DELETE FROM public.user_invitations 
WHERE workspace_id = (
  SELECT id FROM public.workspaces WHERE slug = 'default' LIMIT 1
);

-- Finally, delete the Default Workspace
DELETE FROM public.workspaces WHERE slug = 'default';

-- Ensure root users have no workspace assigned (should already be the case)
UPDATE public.profiles 
SET workspace_id = NULL 
WHERE role = 'root';
