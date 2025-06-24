
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building } from 'lucide-react';
import { UserCard } from './UserCard';

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

interface WorkspaceUserGroupProps {
  workspaceName: string;
  users: UserWithWorkspace[];
  isRootUser: boolean;
  canEditUser: (user: User) => boolean;
  canDeleteUser: (user: User) => boolean;
  getRoleBadgeColor: (role: string) => string;
  canManageAnyTeam: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddToTeam: (userId: string) => void;
}

export function WorkspaceUserGroup({
  workspaceName,
  users,
  isRootUser,
  canEditUser,
  canDeleteUser,
  getRoleBadgeColor,
  canManageAnyTeam,
  onEditUser,
  onDeleteUser,
  onAddToTeam
}: WorkspaceUserGroupProps) {
  return (
    <div>
      {isRootUser && (
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{workspaceName}</h3>
          <Badge variant="secondary">{users.length} users</Badge>
        </div>
      )}
      
      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isRootUser={isRootUser}
            canEditUser={canEditUser}
            canDeleteUser={canDeleteUser}
            getRoleBadgeColor={getRoleBadgeColor}
            canManageAnyTeam={canManageAnyTeam}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
            onAddToTeam={onAddToTeam}
          />
        ))}
      </div>
    </div>
  );
}
