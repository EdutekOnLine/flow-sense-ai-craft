
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';

interface TeamFilterProps {
  selectedTeamId: string | null;
  onTeamSelect: (teamId: string | null) => void;
}

export function TeamFilter({ selectedTeamId, onTeamSelect }: TeamFilterProps) {
  const { teams } = useTeamManagement();

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedTeamId || ''} onValueChange={(value) => onTeamSelect(value || null)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by team" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All teams</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
              {team.member_count !== undefined && (
                <span className="ml-2 text-muted-foreground">
                  ({team.member_count} members)
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedTeam && (
        <Badge variant="outline" className="flex items-center gap-1">
          Team: {selectedTeam.name}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => onTeamSelect(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
}
