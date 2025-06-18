
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Trash2 } from 'lucide-react';
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

interface PendingInvitationsProps {
  invitations: UserInvitation[];
  getRoleBadgeColor: (role: string) => string;
  onDeleteInvitation: (id: string) => void;
  isDeleting: boolean;
}

export function PendingInvitations({ 
  invitations, 
  getRoleBadgeColor, 
  onDeleteInvitation, 
  isDeleting 
}: PendingInvitationsProps) {
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

  return (
    <Card className="bg-gradient-theme-accent border-border">
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
      </CardContent>
    </Card>
  );
}
