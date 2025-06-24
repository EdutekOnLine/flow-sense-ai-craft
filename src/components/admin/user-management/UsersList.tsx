
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { EditUserDialog } from '../EditUserDialog';
import { QuickTeamAssignDialog } from './QuickTeamAssignDialog';
import { UserListFilters } from './UserListFilters';
import { EmptyUsersState } from './EmptyUsersState';
import { WorkspaceUserGroup } from './WorkspaceUserGroup';
import { enhanceUsersWithWorkspaceInfo, groupUsersByWorkspace } from './UserListHelpers';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  workspace_id?: string;
  created_at: string;
}

interface UserWithWorkspace extends User {
  workspace_name?: string;
}

interface UsersListProps {
  users: User[];
}

export function UsersList({ users }: UsersListProps) {
  const { deleteUser } = useUserManagement();
  const { canEditUser, canDeleteUser, getRoleBadgeColor, isRootUser } = useUserPermissions();
  const { teamMembers, canManageTeam } = useTeamManagement();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [teamAssignUser, setTeamAssignUser] = useState<User | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // For root users, we need to fetch workspace information
  const [usersWithWorkspace, setUsersWithWorkspace] = React.useState<UserWithWorkspace[]>([]);

  React.useEffect(() => {
    const enhancedUsers = enhanceUsersWithWorkspaceInfo(users, isRootUser);
    setUsersWithWorkspace(enhancedUsers);
  }, [users, isRootUser]);

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  const handleAddToTeam = (userId: string) => {
    const user = usersWithWorkspace.find(u => u.id === userId);
    if (user) {
      setTeamAssignUser(user);
    }
  };

  // Filter users by selected team
  const filteredUsers = selectedTeamId 
    ? usersWithWorkspace.filter(user => {
        const userTeamIds = teamMembers
          .filter(member => member.user_id === user.id)
          .map(member => member.team_id);
        return userTeamIds.includes(selectedTeamId);
      })
    : usersWithWorkspace;

  // Check if current user can manage teams (for showing team assignment buttons)
  const canManageAnyTeam = teamMembers.some(member => 
    canManageTeam(member.team_id)
  );

  if (users.length === 0) {
    return <EmptyUsersState isRootUser={isRootUser} />;
  }

  // Group users by workspace if root user
  const groupedUsers = groupUsersByWorkspace(filteredUsers, isRootUser);

  return (
    <div className="space-y-6">
      {/* Team Filter */}
      <UserListFilters
        isRootUser={isRootUser}
        selectedTeamId={selectedTeamId}
        onTeamSelect={setSelectedTeamId}
        filteredUsersCount={filteredUsers.length}
      />

      {Object.entries(groupedUsers).map(([workspaceName, workspaceUsers]) => (
        <WorkspaceUserGroup
          key={workspaceName}
          workspaceName={workspaceName}
          users={workspaceUsers}
          isRootUser={isRootUser}
          canEditUser={canEditUser}
          canDeleteUser={canDeleteUser}
          getRoleBadgeColor={getRoleBadgeColor}
          canManageAnyTeam={canManageAnyTeam}
          onEditUser={setEditingUser}
          onDeleteUser={handleDeleteUser}
          onAddToTeam={handleAddToTeam}
        />
      ))}

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {teamAssignUser && (
        <QuickTeamAssignDialog
          user={teamAssignUser}
          open={!!teamAssignUser}
          onOpenChange={(open) => !open && setTeamAssignUser(null)}
        />
      )}
    </div>
  );
}
