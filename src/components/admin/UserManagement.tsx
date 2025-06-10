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
import { UserPlus, Copy, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EditUserDialog } from './EditUserDialog';
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
    
    // Root users can edit all users
    if (profile.role === 'root') return true;
    
    // Admin users can edit all users except root users
    if (profile.role === 'admin' && targetUser.role !== 'root') return true;
    
    // Users can edit themselves
    if (profile.id === targetUser.id) return true;
    
    return false;
  };

  const canDeleteUser = (targetUser: UserProfile) => {
    if (!profile) return false;
    
    // Cannot delete yourself
    if (profile.id === targetUser.id) return false;
    
    // Root users can delete all non-root users
    if (profile.role === 'root' && targetUser.role !== 'root') return true;
    
    // Admin users can delete employees and managers
    if (profile.role === 'admin' && ['employee', 'manager'].includes(targetUser.role)) return true;
    
    return false;
  };

  const canSeeUser = (targetUser: UserProfile) => {
    if (!profile) return false;
    
    // Users can always see themselves
    if (profile.id === targetUser.id) return true;
    
    // Root users can see all users
    if (profile.role === 'root') return true;
    
    // Admin users can see all users except other admins and root (unless it's themselves)
    if (profile.role === 'admin') {
      return !['admin', 'root'].includes(targetUser.role) || targetUser.id === profile.id;
    }
    
    // Manager users can see all users except root
    if (profile.role === 'manager') {
      return targetUser.role !== 'root';
    }
    
    return false;
  };

  const canInviteUsers = () => {
    return profile && ['root', 'admin'].includes(profile.role);
  };

  // Fetch existing users
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

  // Filter users based on permissions
  const users = allUsers.filter(canSeeUser);

  // Fetch pending invitations
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

  // Create invitation mutation with email sending
  const createInvitation = useMutation({
    mutationFn: async (invitation: typeof inviteForm) => {
      // First create the invitation in the database
      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{
          email: invitation.email,
          role: invitation.role,
          department: invitation.department || null,
          invited_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;

      console.log('Created invitation record:', data);

      // Then send the invitation email
      const emailResponse = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: invitation.email,
          role: invitation.role,
          department: invitation.department,
          invitationToken: data.invitation_token,
          invitedByName: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : profile?.email,
          invitedBy: user?.id,
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
      toast({
        title: t('users.errorCreatingInvitation'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete invitation mutation
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

  // Delete user mutation
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
      case 'root': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show access denied message for employees
  if (profile?.role === 'employee') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('users.accessDenied')}</h2>
        <p className="text-gray-600">{t('users.noPermission')}</p>
      </div>
    );
  }

  const isManagerRole = profile?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite New User - Only show for root and admin */}
        {canInviteUsers() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
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
                />
              </div>
              <div>
                <Label htmlFor="role">{t('users.roleLabel')}</Label>
                <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}>
                  <SelectTrigger>
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
                />
              </div>
              <Button 
                onClick={handleInviteUser} 
                disabled={createInvitation.isPending}
                className="w-full"
              >
                {createInvitation.isPending ? t('users.creating') : t('users.sendInvitation')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Users */}
        <Card className={canInviteUsers() ? '' : 'lg:col-span-2'}>
          <CardHeader>
            <CardTitle>
              {isManagerRole ? t('users.teamMembers') : t('users.activeUsers')} ({users.length})
              {isManagerRole && <span className="text-sm font-normal text-gray-600 ml-2">{t('users.viewOnly')}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.department && (
                      <p className="text-xs text-gray-500">{user.department}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {t(`users.${user.role}`).toUpperCase()}
                    </Badge>
                    {/* Show edit button only if user can edit and it's not a manager viewing */}
                    {canEditUser(user) && !isManagerRole && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Show delete button only if user can delete */}
                    {canDeleteUser(user) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                              className="bg-red-600 hover:bg-red-700"
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
        <Card>
          <CardHeader>
            <CardTitle>{t('users.pendingInvitations')} ({invitations.filter(inv => !inv.used_at).length})</CardTitle>
          </CardHeader>
          <CardContent>
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
                        <Badge className="bg-green-100 text-green-800">{t('users.used')}</Badge>
                      ) : new Date(invitation.expires_at) < new Date() ? (
                        <Badge className="bg-gray-100 text-gray-800">{t('users.expired')}</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">{t('users.pending')}</Badge>
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
