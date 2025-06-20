
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Trash2, UserPlus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface InvitationsDisplayProps {
  invitations: UserInvitation[];
  getRoleBadgeColor: (role: string) => string;
  onDeleteInvitation: (id: string) => void;
  isDeleting: boolean;
}

export function InvitationsDisplay({ 
  invitations, 
  getRoleBadgeColor, 
  onDeleteInvitation, 
  isDeleting 
}: InvitationsDisplayProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/?invite=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: t('users.invitationLinkCopied'),
      description: t('users.shareInvitationLink'),
    });
  };

  // Split invitations into pending and used
  const pendingInvitations = invitations.filter(inv => 
    !inv.used_at && new Date(inv.expires_at) > new Date()
  );
  
  const usedInvitations = invitations.filter(inv => 
    inv.used_at || new Date(inv.expires_at) <= new Date()
  );

  const renderInvitationsTable = (invitationsList: UserInvitation[], showCopyLink: boolean = true) => (
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
          {invitationsList.map((invitation) => (
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
                  {showCopyLink && !invitation.used_at && new Date(invitation.expires_at) > new Date() && (
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
                    onClick={() => onDeleteInvitation(invitation.id)}
                    disabled={isDeleting}
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
  );

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No invitations found</h3>
        <p className="text-muted-foreground">
          No invitations have been sent yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations Card */}
      <Card className="bg-gradient-theme-accent border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
              <UserPlus className="h-4 w-4 text-primary-foreground" />
            </div>
            {t('users.pendingInvitations')} ({pendingInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length > 0 ? (
            renderInvitationsTable(pendingInvitations, true)
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No pending invitations
            </div>
          )}
        </CardContent>
      </Card>

      {/* Used Invitations Card */}
      <Card className="bg-gradient-theme-accent border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            Used Invitations ({usedInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usedInvitations.length > 0 ? (
            renderInvitationsTable(usedInvitations, false)
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No used invitations
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
