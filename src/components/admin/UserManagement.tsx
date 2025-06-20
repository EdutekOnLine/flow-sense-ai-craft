
import React from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersList } from './user-management/UsersList';
import { PendingInvitations } from './user-management/PendingInvitations';
import { UserInvitationForm } from './user-management/UserInvitationForm';
import { Users, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserManagement() {
  const { allUsers, invitations } = useUserManagement();
  const { canInviteUsers, canSeeUser, isRootUser } = useUserPermissions();

  // Filter users based on permissions
  const visibleUsers = allUsers.filter(user => canSeeUser(user));

  if (!canInviteUsers()) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to manage users.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            {isRootUser 
              ? 'Manage all users across all workspaces on the platform'
              : 'Manage users and send invitations to new team members'
            }
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Users ({visibleUsers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Pending Invitations ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Send Invitation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
              <CardDescription>
                {isRootUser 
                  ? 'All users across all workspaces on the platform'
                  : 'Users in your workspace'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList users={visibleUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invitations that haven't been accepted yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingInvitations invitations={invitations} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send User Invitation</CardTitle>
              <CardDescription>
                Invite a new user to join the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserInvitationForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
