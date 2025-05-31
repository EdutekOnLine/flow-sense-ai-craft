
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdBy: string;
  triggerType?: string;
  created_at?: string;
  updated_at?: string;
}
