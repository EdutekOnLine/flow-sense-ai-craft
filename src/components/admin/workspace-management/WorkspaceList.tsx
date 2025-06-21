
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users } from 'lucide-react';
import { WorkspaceDeleteDialog } from './WorkspaceDeleteDialog';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  created_at: string;
  user_count?: number;
}

interface WorkspaceListProps {
  workspaces: Workspace[];
}

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  if (workspaces.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Workspaces</h3>
          <p className="text-muted-foreground mb-4">
            Create your first workspace to get started with managing organizations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const availableWorkspaces = workspaces.filter(w => w.id);

  return (
    <div className="space-y-4">
      {workspaces.map((workspace) => (
        <Card key={workspace.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{workspace.name}</h3>
                  <Badge variant="secondary">{workspace.slug}</Badge>
                </div>
                {workspace.description && (
                  <p className="text-muted-foreground mb-3">{workspace.description}</p>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {workspace.user_count} users
                  <span className="mx-2">•</span>
                  Created {new Date(workspace.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <WorkspaceDeleteDialog 
                workspace={workspace}
                availableWorkspaces={availableWorkspaces.filter(w => w.id !== workspace.id)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
