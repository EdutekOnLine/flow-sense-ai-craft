
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Building } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function WorkspaceSelector({ value, onValueChange, disabled }: WorkspaceSelectorProps) {
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces-for-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data as Workspace[];
    },
  });

  return (
    <div>
      <Label htmlFor="workspace">Target Workspace</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading workspaces..." : "Select a workspace"} />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {workspace.name} ({workspace.slug})
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
