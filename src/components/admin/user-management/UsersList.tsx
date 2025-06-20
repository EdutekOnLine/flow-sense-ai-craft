
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { EditUserDialog } from '../EditUserDialog';
import { Trash2, Edit, Users, Building } from 'lucide-react';

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
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // For root users, we need to fetch workspace information
  const [usersWithWorkspace, setUsersWithWorkspace] = React.useState<UserWithWorkspace[]>([]);

  React.useEffect(() => {
    if (isRootUser) {
      // Fetch workspace names for users (this would typically be done in a hook)
      // For now, we'll use the existing users data and add workspace info
      const enhancedUsers = users.map(user => ({
        ...user,
        workspace_name: user.workspace_id ? 'Testers' : 'No Workspace' // Simplified for now
      }));
      setUsersWithWorkspace(enhancedUsers);
    } else {
      setUsersWithWorkspace(users);
    }
  }, [users, isRootUser]);

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  const getDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No users found</h3>
        <p className="text-muted-foreground">
          {isRootUser 
            ? 'No users are currently registered on the platform.'
            : 'No users found in your workspace.'
          }
        </p>
      </div>
    );
  }

  // Group users by workspace if root user
  const groupedUsers = isRootUser
    ? usersWithWorkspace.reduce((acc, user) => {
        const workspaceKey = user.workspace_name || 'No Workspace';
        if (!acc[workspaceKey]) acc[workspaceKey] = [];
        acc[workspaceKey].push(user);
        return acc;
      }, {} as Record<string, UserWithWorkspace[]>)
    : { 'All Users': usersWithWorkspace };

  return (
    <div className="space-y-6">
      {Object.entries(groupedUsers).map(([workspaceName, workspaceUsers]) => (
        <div key={workspaceName}>
          {isRootUser && (
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{workspaceName}</h3>
              <Badge variant="secondary">{workspaceUsers.length} users</Badge>
            </div>
          )}
          
          <div className="grid gap-4">
            {workspaceUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
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
                            Workspace: {user.workspace_name || 'No Workspace'}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {canEditUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
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
                                onClick={() => handleDeleteUser(user.id)}
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
            ))}
          </div>
        </div>
      ))}

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
