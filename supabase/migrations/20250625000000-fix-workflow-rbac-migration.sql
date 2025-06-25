
-- ============================================================================
-- FIXED WORKFLOW RBAC MIGRATION - Phase 1 Database Schema
-- ============================================================================
-- This migration fixes the workspace_id backfill issues and completes
-- the RBAC database schema setup for workflow module.

-- ----------------------------------------------------------------------------
-- STEP 1: Drop the NOT NULL constraints that were added in failed migration
-- ----------------------------------------------------------------------------

-- Remove NOT NULL constraints temporarily to allow fixing data
ALTER TABLE public.workflows ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.workflow_steps ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.workflow_instances ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.workflow_step_assignments ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.saved_workflows ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.workflow_definitions ALTER COLUMN workspace_id DROP NOT NULL;
ALTER TABLE public.workflow_templates ALTER COLUMN workspace_id DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- STEP 2: Fixed data backfill with better logic
-- ----------------------------------------------------------------------------

-- First, ensure we have a default workspace for any orphaned data
DO $$
DECLARE
  default_workspace_id uuid;
BEGIN
  -- Get the first available workspace as default
  SELECT id INTO default_workspace_id FROM public.workspaces LIMIT 1;
  
  -- Backfill workflows table
  UPDATE public.workflows 
  SET workspace_id = COALESCE(
    (SELECT workspace_id FROM public.profiles WHERE id = workflows.created_by),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  -- Backfill workflow_steps table via workflows
  UPDATE public.workflow_steps 
  SET workspace_id = COALESCE(
    (SELECT workspace_id FROM public.workflows WHERE id = workflow_steps.workflow_id),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  -- Fix workflow_instances: try multiple approaches to find workspace_id
  UPDATE public.workflow_instances 
  SET workspace_id = COALESCE(
    -- Try from started_by user's profile
    (SELECT workspace_id FROM public.profiles WHERE id = workflow_instances.started_by),
    -- Try from saved_workflows if workflow_id references it
    (SELECT workspace_id FROM public.saved_workflows WHERE id = workflow_instances.workflow_id),
    -- Try from workflows if workflow_id references it
    (SELECT workspace_id FROM public.workflows WHERE id = workflow_instances.workflow_id),
    -- Fall back to default workspace
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  -- Backfill workflow_step_assignments table via workflow_steps
  UPDATE public.workflow_step_assignments 
  SET workspace_id = COALESCE(
    (SELECT workspace_id FROM public.workflow_steps WHERE id = workflow_step_assignments.workflow_step_id),
    -- Fallback: get from assigned user's profile
    (SELECT workspace_id FROM public.profiles WHERE id = workflow_step_assignments.assigned_to),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  -- Backfill saved_workflows table
  UPDATE public.saved_workflows 
  SET workspace_id = COALESCE(
    (SELECT workspace_id FROM public.profiles WHERE id = saved_workflows.created_by),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  -- Backfill workflow_definitions table
  UPDATE public.workflow_definitions 
  SET workspace_id = COALESCE(
    (SELECT workspace_id FROM public.profiles WHERE id = workflow_definitions.created_by),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

  -- Backfill workflow_templates table
  UPDATE public.workflow_templates 
  SET workspace_id = COALESCE(
    (SELECT workspace_id FROM public.profiles WHERE id = workflow_templates.created_by),
    default_workspace_id
  )
  WHERE workspace_id IS NULL;

END $$;

-- ----------------------------------------------------------------------------
-- STEP 3: Now safely add NOT NULL constraints
-- ----------------------------------------------------------------------------

ALTER TABLE public.workflows ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.workflow_steps ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.workflow_instances ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.workflow_step_assignments ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.saved_workflows ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.workflow_definitions ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.workflow_templates ALTER COLUMN workspace_id SET NOT NULL;

-- ----------------------------------------------------------------------------
-- STEP 4: Verification - Count records to ensure migration success
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  total_workflows int;
  total_steps int;
  total_instances int;
  total_assignments int;
  total_saved int;
BEGIN
  SELECT COUNT(*) INTO total_workflows FROM public.workflows WHERE workspace_id IS NULL;
  SELECT COUNT(*) INTO total_steps FROM public.workflow_steps WHERE workspace_id IS NULL;
  SELECT COUNT(*) INTO total_instances FROM public.workflow_instances WHERE workspace_id IS NULL;
  SELECT COUNT(*) INTO total_assignments FROM public.workflow_step_assignments WHERE workspace_id IS NULL;
  SELECT COUNT(*) INTO total_saved FROM public.saved_workflows WHERE workspace_id IS NULL;
  
  IF total_workflows > 0 OR total_steps > 0 OR total_instances > 0 OR total_assignments > 0 OR total_saved > 0 THEN
    RAISE EXCEPTION 'Migration verification failed: Found NULL workspace_id values';
  END IF;
  
  RAISE NOTICE 'Migration verification passed: All workspace_id values populated successfully';
END $$;
