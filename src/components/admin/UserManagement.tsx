
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Users, Shield } from 'lucide-react';
import { UserPresenceDashboard } from './UserPresenceDashboard';
import { UserInvitationForm } from './user-management/UserInvitationForm';
import { UsersList } from './user-management/UsersList';
import { PendingInvitations } from './user-management/PendingInvitations';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/hooks/useAuth';

export default function UserManagement() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const {
    canEditUser,
    canDeleteUser,
    canSeeUser,
    canInviteUsers,
    getRoleBadgeColor,
    isManagerRole,
  } = useUserPermissions();

  const {
    allUsers,
    invitations,
    createInvitation,
    deleteInvitation,
    deleteUser,
  } = useUserManagement();

  const users = allUsers.filter(canSeeUser);

  if (profile?.role === 'employee') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('users.accessDenied')}</h2>
        <p className="text-muted-foreground">{t('users.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gradient Header */}
      <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-theme-primary rounded-xl"></div>
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                {isManagerRole ? t('users.teamMembers') : t('navigation.users')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {isManagerRole ? t('users.viewTeamMembers') : t('users.manageUsersDescription')}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {users.length} Active Users
                </span>
                {isManagerRole && (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    {t('users.viewOnly')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Presence Dashboard - Only show for root users */}
      {profile?.role === 'root' && (
        <UserPresenceDashboard />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite New User - Only show for root and admin */}
        {canInviteUsers() && (
          <UserInvitationForm
            onInviteUser={(invitation) => createInvitation.mutate(invitation)}
            isLoading={createInvitation.isPending}
          />
        )}

        {/* Active Users */}
        <div className={canInviteUsers() ? '' : 'lg:col-span-2'}>
          <UsersList
            users={users}
            canEditUser={canEditUser}
            canDeleteUser={canDeleteUser}
            getRoleBadgeColor={getRoleBadgeColor}
            onDeleteUser={(userId) => deleteUser.mutate(userId)}
            isDeleting={deleteUser.isPending}
            isManagerRole={isManagerRole}
          />
        </div>
      </div>

      {/* Pending Invitations - Only show for root and admin */}
      {canInviteUsers() && (
        <PendingInvitations
          invitations={invitations}
          getRoleBadgeColor={getRoleBadgeColor}
          onDeleteInvitation={(id) => deleteInvitation.mutate(id)}
          isDeleting={deleteInvitation.isPending}
        />
      )}
    </div>
  );
}
