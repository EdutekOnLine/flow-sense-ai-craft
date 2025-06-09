
import { useState } from 'react';
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

  // Fetch existing users
  const { data: users = [] } = useQuery({
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
          invited_by: user?.id, // Use the current user's ID
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
          invitedBy: user?.id, // Pass the current user's ID
        },
      });

      console.log('Email response:', emailResponse);

      if (emailResponse.error) {
        console.error('Error sending invitation email:', emailResponse.error);
        // Don't throw here - invitation was created successfully, just email failed
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
        title: 'Invitation sent!',
        description: `Invitation email sent to ${data.email}`,
      });
      setInviteForm({ email: '', role: 'employee', department: '' });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating invitation',
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
        title: 'Invitation deleted',
        description: 'The invitation has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting invitation',
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
        title: 'User deleted',
        description: 'The user has been successfully removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInviteUser = () => {
    if (!inviteForm.email) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address.',
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
      title: 'Invitation link copied!',
      description: 'Share this link with the invited user.',
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

  const isRootUser = profile?.role === 'root';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite New User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Invite New User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="user@company.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                value={inviteForm.department}
                onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                placeholder="Engineering, Marketing, etc."
              />
            </div>
            <Button 
              onClick={handleInviteUser} 
              disabled={createInvitation.isPending}
              className="w-full"
            >
              {createInvitation.isPending ? 'Creating...' : 'Send Invitation'}
            </Button>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Active Users ({users.length})</CardTitle>
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
                      {user.role.toUpperCase()}
                    </Badge>
                    {/* Show edit button for root users */}
                    {isRootUser && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Only show delete button if not deleting self and user is not the current user */}
                    {profile?.id !== user.id && (
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
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.first_name} {user.last_name} ({user.email})? 
                              This action cannot be undone and will permanently remove their account and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUser.mutate(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteUser.isPending}
                            >
                              {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
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

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations ({invitations.filter(inv => !inv.used_at).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{invitation.department || '-'}</TableCell>
                  <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {invitation.used_at ? (
                      <Badge className="bg-green-100 text-green-800">Used</Badge>
                    ) : new Date(invitation.expires_at) < new Date() ? (
                      <Badge className="bg-gray-100 text-gray-800">Expired</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
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

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      />
    </div>
  );
}
