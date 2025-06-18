
// NeuraFlow Module Entry Point
export { default as WorkflowBuilder } from './components/WorkflowBuilder';
export { WorkflowInbox } from '@/components/workflow/WorkflowInbox';
export { WorkflowInstanceManager } from '@/components/workflow/WorkflowInstanceManager';

// Re-export hooks for external use
export { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
export { useWorkflowInbox } from '@/hooks/useWorkflowInbox';
export { useMyReusableWorkflows } from '@/hooks/useMyReusableWorkflows';
