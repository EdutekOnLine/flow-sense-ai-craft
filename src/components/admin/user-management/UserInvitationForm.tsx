
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/useWorkspace';

interface UserInvitationFormProps {
  onInviteUser: (invitation: { email: string; role: 'admin' | 'manager' | 'employee'; department: string }) => void;
  isLoading: boolean;
}

export function UserInvitationForm({ onInviteUser, isLoading }: UserInvitationFormProps) {
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
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

    if (!workspace) {
      toast({
        title: 'Workspace Required',
        description: 'You must be in a workspace to send invitations',
        variant: 'destructive',
      });
      return;
    }

    onInviteUser(inviteForm);
    setInviteForm({ email: '', role: 'employee', department: '' });
  };

  return (
    <Card className="bg-gradient-theme-primary border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mr-3">
            <UserPlus className="h-4 w-4 text-primary-foreground" />
          </div>
          {t('users.inviteNewUser')}
          {workspace && (
            <span className="ml-2 text-sm text-muted-foreground">
              to {workspace.name}
            </span>
          )}
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
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {isLoading ? t('users.creating') : t('users.sendInvitation')}
        </Button>
      </CardContent>
    </Card>
  );
}
