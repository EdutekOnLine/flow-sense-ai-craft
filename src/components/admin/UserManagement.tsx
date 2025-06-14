import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Copy, Trash2, Edit, Users, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EditUserDialog } from './EditUserDialog';
import { UserPresenceDashboard } from './UserPresenceDashboard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserInvitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  invitation_token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  created_at: string;
}

export default function UserManagement() {
  const { t } = useTranslation();
  const [isInviting, setIsInviting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  // Permission helper functions
  const canEditUser = (targetUser: UserProfile) => {
    if (!profile) return false;
    
    if (profile.role === 'root') return true;
    if (profile.role === 'admin' && targetUser.role !== 'root') return true;
    if (profile.id === targetUser.id) return true;
    
    return false;
  };

  const canDeleteUser = (targetUser: UserProfile) => {
    if (!profile) return false;
    if (profile.id === targetUser.id) return false;
    if (profile.role === 'root' && targetUser.role !== 'root') return true;
    if (profile.role === 'admin' && ['employee', 'manager'].includes(targetUser.role)) return true;
    
    return false;
  };

  const canSeeUser = (targetUser: UserProfile) => {
    if (!profile) return false;
    if (profile.id === targetUser.id) return true;
    if (profile.role === 'root') return true;
    if (profile.role === 'admin') {
      return !['admin', 'root'].includes(targetUser.role) || targetUser.id === profile.id;
    }
    if (profile.role === 'manager') {
      return targetUser.role !== 'root';
    }
    
    return false;
  };

  const canInviteUsers = () => {
    return profile && ['root', 'admin'].includes(profile.role);
  };

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const users = allUsers.filter(canSeeUser);

  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserInvitation[];
    },
  });

  const createInvitation = useMutation({
    mutationFn: async (invitation: typeof inviteForm) => {
      // Validate that user is authenticated and has required role
      if (!user?.id) {
        throw new Error('You must be logged in to send invitations');
      }

      if (!profile || !['admin', 'root'].includes(profile.role)) {
        throw new Error('You do not have permission to send invitations');
      }

      console.log('Creating invitation with user ID:', user.id);

      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{
          email: invitation.email,
          role: invitation.role,
          department: invitation.department || null,
          invited_by: user.id,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Database error creating invitation:', error);
        throw new Error(`Failed to create invitation: ${error.message}`);
      }

      console.log('Created invitation record:', data);

      const emailResponse = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: invitation.email,
          role: invitation.role,
          department: invitation.department,
          invitationToken: data.invitation_token,
          invitedByName: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile?.email,
          invitedBy: user.id,
        },
      });

      console.log('Email response:', emailResponse);

      if (emailResponse.error) {
        console.error('Error sending invitation email:', emailResponse.error);
        toast({
          title: 'Invitation created but email failed',
          description: 'You can copy the invitation link manually.',
          variant: 'destructive',
        });
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: t('users.invitationSent'),
        description: t('users.invitationSentMessage', { email: data.email }),
      });
      setInviteForm({ email: '', role: 'employee', department: '' });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      console.error('Error creating invitation:', error);
      toast({
        title: t('users.errorCreatingInvitation'),
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const deleteInvitation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t('users.invitationDeleted'),
        description: t('users.invitationDeletedMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: t('users.errorDeletingInvitation'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: {
          userId,
          adminId: user?.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: t('users.userDeleted'),
        description: t('users.userDeletedMessage'),
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: t('users.errorDeletingUser'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInviteUser = () => {
    if (!inviteForm.email) {
      toast({
        title: t('users.emailRequired'),
        description: t('users.enterEmail'),
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to send invitations',
        variant: 'destructive',
      });
      return;
    }

    if (!profile || !['admin', 'root'].includes(profile.role)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to send invitations',
        variant: 'destructive',
      });
      return;
    }

    createInvitation.mutate(inviteForm);
  };

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/?invite=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: t('users.invitationLinkCopied'),
      description: t('users.shareInvitationLink'),
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'root': return 'bg-role-root text-role-root-foreground';
      case 'admin': return 'bg-role-admin text-role-admin-foreground';
      case 'manager': return 'bg-role-manager text-role-manager-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (profile?.role === 'employee') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('users.accessDenied')}</h2>
        <p className="text-muted-foreground">{t('users.noPermission')}</p>
      </div>
    );
  }

  const isManagerRole = profile?.role === 'manager';

  return (
    <div className="space-y-8">
      {/* Gradient Header */}
      <div className="relative bg-gradient-theme-primary border border-border rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-theme-card rounded-xl"></div>
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
          <Card className="bg-gradient-theme-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
                  <UserPlus className="h-4 w-4 text-primary-foreground" />
                </div>
                {t('users.inviteNewUser')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">{t('users.emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder={t('users.emailPlaceholder')}
                  className="bg-card/80 backdrop-blur-sm"
                />
              </div>
              <div>
                <Label htmlFor="role">{t('users.roleLabel')}</Label>
                <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}>
                  <SelectTrigger className="bg-card/80 backdrop-blur-sm">
                    <SelectValue placeholder={t('users.selectRolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{t('users.employee')}</SelectItem>
                    <SelectItem value="manager">{t('users.manager')}</SelectItem>
                    <SelectItem value="admin">{t('users.administrator')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">{t('users.departmentLabel')}</Label>
                <Input
                  id="department"
                  value={inviteForm.department}
                  onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                  placeholder={t('users.departmentPlaceholder')}
                  className="bg-card/80 backdrop-blur-sm"
                />
              </div>
              <Button 
                onClick={handleInviteUser} 
                disabled={createInvitation.isPending}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {createInvitation.isPending ? t('users.creating') : t('users.sendInvitation')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Users */}
        <Card className={`bg-gradient-theme-card border-border ${canInviteUsers() ? '' : 'lg:col-span-2'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-4 w-4 text-primary-foreground" />
                </div>
                {isManagerRole ? t('users.teamMembers') : t('users.activeUsers')} ({users.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-sm border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.department && (
                      <p className="text-xs text-muted-foreground">{user.department}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {t(`users.${user.role}`).toUpperCase()}
                    </Badge>
                    {canEditUser(user) && !isManagerRole && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(user)}
                        className="text-primary hover:text-primary/90 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteUser(user) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('users.deleteUserConfirm')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('users.deleteUserMessage', {
                                firstName: user.first_name,
                                lastName: user.last_name,
                                email: user.email
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser.mutate(user.id)}
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={deleteUser.isPending}
                            >
                              {deleteUser.isPending ? t('users.deleting') : t('users.deleteUser')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations - Only show for root and admin */}
      {canInviteUsers() && (
        <Card className="bg-gradient-theme-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
                <Copy className="h-4 w-4 text-primary-foreground" />
              </div>
              {t('users.pendingInvitations')} ({invitations.filter(inv => !inv.used_at).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-card/60 backdrop-blur-sm rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('users.email')}</TableHead>
                    <TableHead>{t('users.role')}</TableHead>
                    <TableHead>{t('users.department')}</TableHead>
                    <TableHead>{t('users.expires')}</TableHead>
                    <TableHead>{t('users.status')}</TableHead>
                    <TableHead>{t('users.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(invitation.role)}>
                          {t(`users.${invitation.role}`).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{invitation.department || '-'}</TableCell>
                      <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {invitation.used_at ? (
                          <Badge className="bg-status-success-bg text-status-success">{t('users.used')}</Badge>
                        ) : new Date(invitation.expires_at) < new Date() ? (
                          <Badge className="bg-muted text-muted-foreground">{t('users.expired')}</Badge>
                        ) : (
                          <Badge className="bg-status-pending-bg text-status-pending">{t('users.pending')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!invitation.used_at && new Date(invitation.expires_at) > new Date() && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInvitationLink(invitation.invitation_token)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteInvitation.mutate(invitation.id)}
                            disabled={deleteInvitation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      />
    </div>
  );
}
