
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, UserMinus, Search } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManageTeamMembersDialogProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTeamMembersDialog({ teamId, open, onOpenChange }: ManageTeamMembersDialogProps) {
  const {
    teams,
    getTeamMembers,
    workspaceUsers,
    addTeamMember,
    removeTeamMember,
    canManageTeam,
  } = useTeamManagement();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const team = teams.find(t => t.id === teamId);
  const teamMembers = getTeamMembers(teamId);
  const canManage = canManageTeam(teamId);

  const memberUserIds = new Set(teamMembers.map(member => member.user_id));
  const availableUsers = workspaceUsers.filter(user => !memberUserIds.has(user.id));

  const filteredTeamMembers = teamMembers.filter(member => {
    if (!searchTerm) return true;
    const user = member.user;
    if (!user) return false;
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleAddMember = () => {
    if (selectedUserId) {
      addTeamMember({ team_id: teamId, user_id: selectedUserId });
      setSelectedUserId('');
    }
  };

  const handleRemoveMember = (userId: string) => {
    removeTeamMember({ team_id: teamId, user_id: userId });
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Team Members - {team.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member */}
          {canManage && availableUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Team Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a user to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                          {user.department && (
                            <span className="text-muted-foreground"> - {user.department}</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMember} disabled={!selectedUserId}>
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Members ({teamMembers.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {filteredTeamMembers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No members found matching your search.' : 'No team members yet.'}
                    </div>
                  )}
                  
                  {filteredTeamMembers.map((member) => {
                    const user = member.user;
                    if (!user) return null;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{user.role}</Badge>
                            {user.department && (
                              <Badge variant="secondary">{user.department}</Badge>
                            )}
                            {member.role_in_team !== 'member' && (
                              <Badge variant="default">{member.role_in_team}</Badge>
                            )}
                          </div>
                        </div>
                        
                        {canManage && member.user_id !== team.manager_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
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
