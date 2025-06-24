
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Users, UserPlus } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  workspace_id?: string;
}

interface UserTeamInfoProps {
  user: User;
  onAddToTeam?: (userId: string) => void;
}

export function UserTeamInfo({ user, onAddToTeam }: UserTeamInfoProps) {
  const { teams, teamMembers, canManageTeam } = useTeamManagement();

  // Get teams where user is a manager
  const managedTeams = teams.filter(team => team.manager_id === user.id);
  
  // Get teams where user is a member
  const memberTeams = teamMembers
    .filter(member => member.user_id === user.id)
    .map(member => teams.find(team => team.id === member.team_id))
    .filter(Boolean);

  // Get unique teams (excluding managed teams from member teams to avoid duplicates)
  const memberOnlyTeams = memberTeams.filter(team => 
    !managedTeams.some(managedTeam => managedTeam.id === team?.id)
  );

  const hasTeams = managedTeams.length > 0 || memberOnlyTeams.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Managed Teams */}
      {managedTeams.map(team => (
        <Badge key={`manager-${team.id}`} variant="default" className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          {team.name} (Manager)
        </Badge>
      ))}

      {/* Member Teams */}
      {memberOnlyTeams.map(team => (
        <Badge key={`member-${team?.id}`} variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {team?.name}
        </Badge>
      ))}

      {/* No teams indicator */}
      {!hasTeams && (
        <span className="text-sm text-muted-foreground">No teams</span>
      )}

      {/* Add to team button for admins */}
      {onAddToTeam && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddToTeam(user.id)}
          className="h-6 px-2 text-xs"
        >
          <UserPlus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
