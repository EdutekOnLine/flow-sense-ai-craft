
import React, { useState, useEffect } from 'react';
import { useEnhancedWorkflowPermissions } from '@/hooks/useEnhancedWorkflowPermissions';
import { useTeamAwareWorkflows } from '@/hooks/useTeamAwareWorkflows';
import { useSavedWorkflows } from '@/hooks/useSavedWorkflows';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Users, Crown, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoleBasedWorkflowListProps {
  onSelectWorkflow?: (workflowId: string) => void;
  onEditWorkflow?: (workflowId: string) => void;
}

export function RoleBasedWorkflowList({ 
  onSelectWorkflow, 
  onEditWorkflow 
}: RoleBasedWorkflowListProps) {
  const { 
    canEditWorkflows, 
    canDeleteSpecificWorkflow, 
    canViewWorkflow,
    userRole,
    dashboardScope 
  } = useEnhancedWorkflowPermissions();
  
  const { buildWorkflowFilters } = useTeamAwareWorkflows();
  const { workflows, isLoading, deleteWorkflow } = useSavedWorkflows();
  const { toast } = useToast();
  
  const [filteredWorkflows, setFilteredWorkflows] = useState(workflows);

  // Filter workflows based on role permissions
  useEffect(() => {
    const filtered = workflows.filter(workflow => {
      return canViewWorkflow({
        createdBy: workflow.created_by,
        isReusable: workflow.is_reusable,
        hasAssignment: false // This would need to be checked against assignments
      });
    });
    
    setFilteredWorkflows(filtered);
  }, [workflows, canViewWorkflow]);

  const handleDeleteWorkflow = async (workflow: any) => {
    if (!canDeleteSpecificWorkflow(workflow.created_by)) {
      toast({
        title: "Permission Denied",
        description: "You can only delete workflows you created",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteWorkflow(workflow.id);
      toast({
        title: "Workflow Deleted",
        description: "The workflow has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'root': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'manager': return <Users className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getScopeDescription = () => {
    switch (dashboardScope) {
      case 'global': return 'Viewing all workflows across all workspaces';
      case 'workspace': return 'Viewing all workflows in your workspace';
      case 'team': return 'Viewing workflows involving your team';
      case 'personal': return 'Viewing your assigned and reusable workflows';
      default: return 'No workflows available';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading workflows...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRoleIcon(userRole)}
            Workflows ({dashboardScope} scope)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {getScopeDescription()}
          </p>
        </CardHeader>
      </Card>

      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No workflows available for your role and permissions.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      {workflow.is_reusable && (
                        <Badge variant="secondary">Reusable</Badge>
                      )}
                    </div>
                    
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {workflow.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                      <span>Steps: {workflow.nodes?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onSelectWorkflow && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectWorkflow(workflow.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canEditWorkflows && onEditWorkflow && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEditWorkflow(workflow.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canDeleteSpecificWorkflow(workflow.created_by) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
