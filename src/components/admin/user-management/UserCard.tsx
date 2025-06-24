
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { UserTeamInfo } from './UserTeamInfo';
import { Trash2, Edit, Users } from 'lucide-react';
import { getDisplayName } from './UserListHelpers';

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

interface UserCardProps {
  user: UserWithWorkspace;
  isRootUser: boolean;
  canEditUser: (user: User) => boolean;
  canDeleteUser: (user: User) => boolean;
  getRoleBadgeColor: (role: string) => string;
  canManageAnyTeam: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddToTeam: (userId: string) => void;
}

export function UserCard({
  user,
  isRootUser,
  canEditUser,
  canDeleteUser,
  getRoleBadgeColor,
  canManageAnyTeam,
  onEditUser,
  onDeleteUser,
  onAddToTeam
}: UserCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{getDisplayName(user)}</h3>
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{user.email}</p>
            
            {user.department && (
              <p className="text-sm text-muted-foreground">
                Department: {user.department}
              </p>
            )}
            
            {isRootUser && (
              <p className="text-sm text-muted-foreground">
                Workspace: {user.workspace_name || (user.role === 'root' ? 'Super Users' : 'No Workspace')}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </p>

            {/* Team Information */}
            {!isRootUser && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Teams:</span>
                </div>
                <UserTeamInfo 
                  user={user} 
                  onAddToTeam={canManageAnyTeam ? onAddToTeam : undefined}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {canEditUser(user) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditUser(user)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {canDeleteUser(user) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {getDisplayName(user)}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteUser(user.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
