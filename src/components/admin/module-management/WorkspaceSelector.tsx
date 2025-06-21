
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  user_count?: number;
  active_modules_count?: number;
}

interface WorkspaceSelectorProps {
  selectedWorkspaceId: string | null;
  onWorkspaceSelect: (workspaceId: string) => void;
}

export function WorkspaceSelector({ selectedWorkspaceId, onWorkspaceSelect }: WorkspaceSelectorProps) {
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces-for-module-management'],
    queryFn: async () => {
      // Get workspaces with user counts and module statistics
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name, slug')
        .order('name');
      
      if (workspacesError) throw workspacesError;

      // Get user counts for each workspace
      const { data: userCounts, error: userCountsError } = await supabase
        .from('profiles')
        .select('workspace_id')
        .not('workspace_id', 'is', null);

      if (userCountsError) throw userCountsError;

      // Get active module counts for each workspace
      const { data: moduleCounts, error: moduleCountsError } = await supabase
        .from('workspace_modules')
        .select('workspace_id, is_active')
        .eq('is_active', true);

      if (moduleCountsError) throw moduleCountsError;

      // Combine the data
      return workspacesData.map(workspace => ({
        ...workspace,
        user_count: userCounts.filter(u => u.workspace_id === workspace.id).length,
        active_modules_count: moduleCounts.filter(m => m.workspace_id === workspace.id).length,
      }));
    },
  });

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5" />
          Target Workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select 
          value={selectedWorkspaceId || ''} 
          onValueChange={onWorkspaceSelect}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Loading workspaces..." : "Select a workspace"} />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                <div className="flex items-center gap-2 w-full">
                  <Building className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {workspace.user_count} users • {workspace.active_modules_count} active modules
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedWorkspace && (
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Selected Workspace:</span>
              <span className="text-muted-foreground">{selectedWorkspace.name}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {selectedWorkspace.user_count} users
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {selectedWorkspace.active_modules_count} active modules
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
