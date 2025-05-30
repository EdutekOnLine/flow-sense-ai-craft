
import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StepNodeData {
  label: string;
  description: string;
  estimatedHours: number;
  assignedTo: string;
  teamMembers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  }>;
}

function WorkflowStepNode({ id, data, selected }: NodeProps<StepNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [stepData, setStepData] = useState<StepNodeData>(data);

  const getTeamMemberName = (userId: string) => {
    if (userId === 'unassigned') return 'Unassigned';
    const member = stepData.teamMembers.find(m => m.id === userId);
    return member ? `${member.first_name} ${member.last_name}` : 'Unknown';
  };

  const updateNodeData = (updates: Partial<StepNodeData>) => {
    const newData = { ...stepData, ...updates };
    setStepData(newData);
    // In a real implementation, you'd update the node data in the parent component
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate">{stepData.label}</h3>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Step</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="step-name">Step Name</Label>
                    <Input
                      id="step-name"
                      value={stepData.label}
                      onChange={(e) => updateNodeData({ label: e.target.value })}
                      placeholder="Enter step name..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="step-description">Description</Label>
                    <Textarea
                      id="step-description"
                      value={stepData.description}
                      onChange={(e) => updateNodeData({ description: e.target.value })}
                      placeholder="Describe what needs to be done..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="step-assigned">Assign to</Label>
                    <Select 
                      value={stepData.assignedTo} 
                      onValueChange={(value) => updateNodeData({ assignedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {stepData.teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.first_name} {member.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="step-hours">Estimated Hours</Label>
                    <Input
                      id="step-hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={stepData.estimatedHours}
                      onChange={(e) => updateNodeData({ estimatedHours: Number(e.target.value) })}
                      placeholder="e.g., 8"
                    />
                  </div>
                  
                  <Button onClick={() => setIsEditing(false)} className="w-full">
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-2">
          {stepData.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{stepData.description}</p>
          )}
          
          <div className="flex flex-wrap gap-1">
            {stepData.assignedTo && stepData.assignedTo !== 'unassigned' && (
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {getTeamMemberName(stepData.assignedTo)}
              </Badge>
            )}
            
            {stepData.estimatedHours > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stepData.estimatedHours}h
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </>
  );
}

export default memo(WorkflowStepNode);
