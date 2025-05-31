
// Mock API functions for workflow operations
export const getWorkflow = async (id: string) => {
  // Mock implementation
  return {
    id,
    name: 'Sample Workflow',
    description: 'A sample workflow',
    nodes: [],
    edges: [],
    createdBy: 'user-1',
    triggerType: 'manual'
  };
};

export const createWorkflow = async (data: any) => {
  // Mock implementation
  return {
    id: 'new-workflow-' + Date.now(),
    ...data
  };
};

export const updateWorkflow = async (id: string, data: any) => {
  // Mock implementation
  return {
    id,
    ...data
  };
};
