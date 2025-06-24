
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { UserPlus, UserMinus } from 'lucide-react';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

interface QuickTeamAssignDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickTeamAssignDialog({ user, open, onOpenChange }: QuickTeamAssignDialogProps) {
  const { teams, teamMembers, addTeamMember, removeTeamMember, canManageTeam } = useTeamManagement();
  const [selectedTeamId, setSelectedTeamId] = useState('');

  if (!user) return null;

  // Get user's current teams
  const userTeamMemberships = teamMembers.filter(member => member.user_id === user.id);
  const userTeamIds = new Set(userTeamMemberships.map(member => member.team_id));

  // Get teams the current user can manage and user is not already in
  const availableTeams = teams.filter(team => 
    canManageTeam(team.id) && !userTeamIds.has(team.id)
  );

  // Get teams the user is currently in that can be managed
  const currentTeams = userTeamMemberships
    .map(member => teams.find(team => team.id === member.team_id))
    .filter((team): team is NonNullable<typeof team> => team !== undefined)
    .filter(team => canManageTeam(team.id));

  const handleAddToTeam = () => {
    if (selectedTeamId) {
      addTeamMember({ team_id: selectedTeamId, user_id: user.id });
      setSelectedTeamId('');
    }
  };

  const handleRemoveFromTeam = (teamId: string) => {
    removeTeamMember({ team_id: teamId, user_id: user.id });
  };

  const getDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Teams - {getDisplayName(user)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add to Team */}
          {availableTeams.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Add to Team</h3>
              <div className="flex gap-3">
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
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
                <Button onClick={handleAddToTeam} disabled={!selectedTeamId}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Current Teams */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current Teams</h3>
            {currentTeams.length === 0 ? (
              <p className="text-sm text-muted-foreground">User is not in any teams you can manage.</p>
            ) : (
              <div className="space-y-2">
                {currentTeams.map((team) => {
                  const membership = userTeamMemberships.find(m => m.team_id === team.id);
                  const isManager = team.manager_id === user.id;
                  
                  return (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{team.name}</span>
                        {isManager && <Badge variant="default">Manager</Badge>}
                        {membership && membership.role_in_team !== 'member' && !isManager && (
                          <Badge variant="outline">{membership.role_in_team}</Badge>
                        )}
                      </div>
                      {!isManager && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromTeam(team.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
