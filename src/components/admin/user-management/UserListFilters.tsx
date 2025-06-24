
import React from 'react';
import { TeamFilter } from './TeamFilter';

interface UserListFiltersProps {
  isRootUser: boolean;
  selectedTeamId: string | null;
  onTeamSelect: (teamId: string | null) => void;
  filteredUsersCount: number;
}

export function UserListFilters({ 
  isRootUser, 
  selectedTeamId, 
  onTeamSelect, 
  filteredUsersCount 
}: UserListFiltersProps) {
  if (isRootUser) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <TeamFilter 
        selectedTeamId={selectedTeamId}
        onTeamSelect={onTeamSelect}
      />
      {selectedTeamId && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsersCount} users in selected team
        </p>
      )}
    </div>
  );
}
