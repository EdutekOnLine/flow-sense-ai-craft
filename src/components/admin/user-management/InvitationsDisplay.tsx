
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Trash2, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
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
  onResendInvitation: (invitation: UserInvitation) => void;
  isDeleting: boolean;
  isResending: boolean;
}

export function InvitationsDisplay({ 
  invitations, 
  getRoleBadgeColor, 
  onDeleteInvitation,
  onResendInvitation,
  isDeleting,
  isResending
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

  // Filter invitations into categories
  const pendingInvitations = invitations.filter(inv => 
    !inv.used_at && new Date(inv.expires_at) > new Date()
  );

  const usedInvitations = invitations.filter(inv => 
    inv.used_at !== null
  );

  const expiredInvitations = invitations.filter(inv => 
    !inv.used_at && new Date(inv.expires_at) < new Date()
  );

  const renderInvitationTable = (categoryInvitations: UserInvitation[], showActions: boolean = true, showCopyLink: boolean = true, showResend: boolean = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('users.email')}</TableHead>
          <TableHead>{t('users.role')}</TableHead>
          <TableHead>{t('users.department')}</TableHead>
          <TableHead>{t('users.expires')}</TableHead>
          {showActions && <TableHead>{t('users.actions')}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {categoryInvitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell>{invitation.email}</TableCell>
            <TableCell>
              <Badge className={getRoleBadgeColor(invitation.role)}>
                {t(`users.${invitation.role}`).toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>{invitation.department || '-'}</TableCell>
            <TableCell>
              {new Date(invitation.expires_at).toLocaleDateString()}
              {invitation.used_at && (
                <div className="text-xs text-muted-foreground">
                  Used: {new Date(invitation.used_at).toLocaleDateString()}
                </div>
              )}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  {showCopyLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInvitationLink(invitation.invitation_token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  {showResend && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResendInvitation(invitation)}
                      disabled={isResending}
                    >
                      <Send className="h-4 w-4" />
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
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderEmptyState = (message: string) => (
    <div className="text-center py-8 text-muted-foreground">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Pending Invitations Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Pending Invitations ({pendingInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length > 0 ? (
            <div className="bg-card/60 backdrop-blur-sm rounded-lg overflow-hidden">
              {renderInvitationTable(pendingInvitations, true, true, true)}
            </div>
          ) : (
            renderEmptyState("No pending invitations")
          )}
        </CardContent>
      </Card>

      {/* Used Invitations Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Used Invitations ({usedInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usedInvitations.length > 0 ? (
            <div className="bg-card/60 backdrop-blur-sm rounded-lg overflow-hidden">
              {renderInvitationTable(usedInvitations, true, false, false)}
            </div>
          ) : (
            renderEmptyState("No used invitations")
          )}
        </CardContent>
      </Card>

      {/* Expired Invitations Card */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Expired Invitations ({expiredInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiredInvitations.length > 0 ? (
            <div className="bg-card/60 backdrop-blur-sm rounded-lg overflow-hidden">
              {renderInvitationTable(expiredInvitations, true, false, true)}
            </div>
          ) : (
            renderEmptyState("No expired invitations")
          )}
        </CardContent>
      </Card>
    </div>
  );
}
