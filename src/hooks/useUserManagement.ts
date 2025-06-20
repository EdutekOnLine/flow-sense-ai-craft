
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from '@/hooks/useWorkspace';

interface UserInvitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  workspace_id?: string;
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
  workspace_id?: string;
  created_at: string;
}

export function useUserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const { workspace } = useWorkspace();

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

  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      let query = supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      // Non-root users can only see invitations for their workspace
      if (profile?.role !== 'root' && workspace?.id) {
        query = query.eq('workspace_id', workspace.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as UserInvitation[];
    },
    enabled: !!profile,
  });

  const createInvitation = useMutation({
    mutationFn: async (invitation: { 
      email: string; 
      role: 'admin' | 'manager' | 'employee'; 
      department: string;
      workspace_id?: string;
    }) => {
      if (!user?.id) {
        throw new Error('You must be logged in to send invitations');
      }

      if (!profile || !['admin', 'root'].includes(profile.role)) {
        throw new Error('You do not have permission to send invitations');
      }

      console.log('Creating invitation with user ID:', user.id);

      // Determine the target workspace
      let targetWorkspaceId: string;
      
      if (profile.role === 'root') {
        // Root users must specify a workspace
        if (!invitation.workspace_id) {
          throw new Error('Workspace selection is required for root users');
        }
        targetWorkspaceId = invitation.workspace_id;
      } else {
        // Non-root users invite to their own workspace
        if (!workspace?.id) {
          throw new Error('You must be assigned to a workspace to send invitations');
        }
        targetWorkspaceId = workspace.id;
      }

      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{
          email: invitation.email,
          role: invitation.role,
          department: invitation.department || null,
          workspace_id: targetWorkspaceId,
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
          workspaceId: targetWorkspaceId,
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

  const resendInvitation = useMutation({
    mutationFn: async (invitation: UserInvitation) => {
      if (!user?.id) {
        throw new Error('You must be logged in to resend invitations');
      }

      if (!profile || !['admin', 'root'].includes(profile.role)) {
        throw new Error('You do not have permission to resend invitations');
      }

      console.log('Resending invitation for:', invitation.email);

      // First, delete the old invitation
      const { error: deleteError } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitation.id);

      if (deleteError) {
        console.error('Error deleting old invitation:', deleteError);
        throw new Error(`Failed to delete old invitation: ${deleteError.message}`);
      }

      // Create a new invitation with the same details
      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{
          email: invitation.email,
          role: invitation.role,
          department: invitation.department,
          workspace_id: invitation.workspace_id,
          invited_by: user.id,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Database error creating new invitation:', error);
        throw new Error(`Failed to create new invitation: ${error.message}`);
      }

      console.log('Created new invitation record:', data);

      // Send the invitation email
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
          workspaceId: invitation.workspace_id,
        },
      });

      console.log('Email response:', emailResponse);

      if (emailResponse.error) {
        console.error('Error sending invitation email:', emailResponse.error);
        toast({
          title: 'Invitation resent but email failed',
          description: 'You can copy the invitation link manually.',
          variant: 'destructive',
        });
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: t('users.invitationResent'),
        description: t('users.invitationResentMessage', { email: data.email }),
      });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    onError: (error: any) => {
      console.error('Error resending invitation:', error);
      toast({
        title: t('users.errorResendingInvitation'),
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

  return {
    allUsers,
    invitations,
    createInvitation,
    resendInvitation,
    deleteInvitation,
    deleteUser,
  };
}
