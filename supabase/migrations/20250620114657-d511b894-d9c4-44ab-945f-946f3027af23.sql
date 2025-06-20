
-- Step 1: Fix root user configuration - set workspace_id to NULL for root users
UPDATE public.profiles 
SET workspace_id = NULL 
WHERE role = 'root';

-- Step 2: Create a sample workspace for testing
INSERT INTO public.workspaces (id, name, slug, description, owner_id, settings) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Sample Workspace',
  'sample-workspace',
  'A sample workspace for testing purposes',
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  '{}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Assign non-root users to the sample workspace
UPDATE public.profiles 
SET workspace_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE role != 'root' AND workspace_id IS NULL;

-- Step 4: Create sample workflows
INSERT INTO public.workflows (id, name, description, created_by, status, priority, is_reusable) 
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'Employee Onboarding Process',
    'Complete workflow for onboarding new employees',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    'active',
    'high',
    true
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002', 
    'Project Review Workflow',
    'Standard process for reviewing project deliverables',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    'active',
    'medium',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Step 5: Create workflow steps
INSERT INTO public.workflow_steps (id, workflow_id, name, description, step_order, assigned_to, status) 
VALUES 
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    'Prepare Welcome Package',
    'Prepare welcome materials and workspace setup',
    1,
    (SELECT id FROM public.profiles WHERE role != 'root' LIMIT 1),
    'pending'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001', 
    'IT Setup',
    'Configure computer, accounts, and access permissions',
    2,
    (SELECT id FROM public.profiles WHERE role != 'root' LIMIT 1 OFFSET 1),
    'pending'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440002',
    'Review Project Documents',
    'Review all project documentation and deliverables',
    1,
    (SELECT id FROM public.profiles WHERE role != 'root' LIMIT 1),
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create workflow instances (active workflows)
INSERT INTO public.workflow_instances (id, workflow_id, started_by, current_step_id, status, start_data)
VALUES 
  (
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    '770e8400-e29b-41d4-a716-446655440001',
    'active',
    '{"employee_name": "John Doe", "department": "Engineering"}'::jsonb
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440002', 
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    '770e8400-e29b-41d4-a716-446655440003',
    'active',
    '{"project_name": "Q1 Website Redesign"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create workflow step assignments (tasks for users)
INSERT INTO public.workflow_step_assignments (id, workflow_step_id, assigned_to, assigned_by, status, notes)
VALUES 
  (
    '990e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.profiles WHERE role != 'root' LIMIT 1),
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    'pending',
    'Please prepare the standard welcome package for new employee John Doe'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440002',
    '770e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM public.profiles WHERE role != 'root' LIMIT 1 OFFSET 1),
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    'pending', 
    'Set up IT equipment and accounts for John Doe in Engineering'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440003',
    '770e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM public.profiles WHERE role != 'root' LIMIT 1),
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    'in_progress',
    'Currently reviewing Q1 Website Redesign project documents'
  )
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create sample saved workflows
INSERT INTO public.saved_workflows (id, name, description, created_by, is_reusable, nodes, edges)
VALUES 
  (
    'aa0e8400-e29b-41d4-a716-446655440001',
    'Simple Approval Workflow',
    'A basic two-step approval process',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true,
    '[
      {
        "id": "start-1",
        "type": "start",
        "position": {"x": 100, "y": 100},
        "data": {"label": "Start", "stepType": "start"}
      },
      {
        "id": "approval-1", 
        "type": "task",
        "position": {"x": 300, "y": 100},
        "data": {"label": "Review Request", "stepType": "task", "assignedTo": null}
      },
      {
        "id": "end-1",
        "type": "end", 
        "position": {"x": 500, "y": 100},
        "data": {"label": "Complete", "stepType": "end"}
      }
    ]'::jsonb,
    '[
      {"id": "e1", "source": "start-1", "target": "approval-1"},
      {"id": "e2", "source": "approval-1", "target": "end-1"}
    ]'::jsonb
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440002',
    'Purchase Request Process',
    'Multi-step process for handling purchase requests',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
    true,
    '[
      {
        "id": "start-2",
        "type": "start",
        "position": {"x": 50, "y": 150},
        "data": {"label": "Submit Request", "stepType": "start"}
      },
      {
        "id": "review-2",
        "type": "task", 
        "position": {"x": 250, "y": 150},
        "data": {"label": "Manager Review", "stepType": "task", "assignedTo": null}
      },
      {
        "id": "finance-2",
        "type": "task",
        "position": {"x": 450, "y": 150}, 
        "data": {"label": "Finance Approval", "stepType": "task", "assignedTo": null}
      },
      {
        "id": "end-2",
        "type": "end",
        "position": {"x": 650, "y": 150},
        "data": {"label": "Approved", "stepType": "end"}
      }
    ]'::jsonb,
    '[
      {"id": "e3", "source": "start-2", "target": "review-2"},
      {"id": "e4", "source": "review-2", "target": "finance-2"},
      {"id": "e5", "source": "finance-2", "target": "end-2"}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Step 9: Ensure core modules exist and are available (FIXED ARRAY FORMAT)
INSERT INTO public.modules (id, name, display_name, description, version, is_core, required_modules, settings_schema)
VALUES 
  (
    'bb0e8400-e29b-41d4-a716-446655440001',
    'neura-core',
    'NeuraCore',
    'Core platform functionality',
    '1.0.0',
    true,
    ARRAY[]::text[],
    '{}'::jsonb
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440002', 
    'neura-flow',
    'NeuraFlow',
    'Workflow management and automation',
    '1.0.0',
    false,
    ARRAY['neura-core']::text[],
    '{}'::jsonb
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440003',
    'neura-crm',
    'NeuraCRM', 
    'Customer relationship management',
    '1.0.0',
    false,
    ARRAY['neura-core']::text[],
    '{}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Step 10: Activate modules for the sample workspace
INSERT INTO public.workspace_modules (workspace_id, module_id, is_active, activated_by)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  m.id,
  true,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
FROM public.modules m
WHERE m.name IN ('neura-core', 'neura-flow', 'neura-crm')
ON CONFLICT (workspace_id, module_id) DO UPDATE SET is_active = true;
