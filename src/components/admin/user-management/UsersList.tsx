
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, Trash2, Shield } from 'lucide-react';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
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

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  created_at: string;
}

interface UsersListProps {
  users: UserProfile[];
  canEditUser: (user: UserProfile) => boolean;
  canDeleteUser: (user: UserProfile) => boolean;
  getRoleBadgeColor: (role: string) => string;
  onDeleteUser: (userId: string) => void;
  isDeleting: boolean;
  isManagerRole: boolean;
}

export function UsersList({ 
  users, 
  canEditUser, 
  canDeleteUser, 
  getRoleBadgeColor, 
  onDeleteUser, 
  isDeleting,
  isManagerRole 
}: UsersListProps) {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  return (
    <>
      <Card className={`bg-gradient-theme-secondary border-border`}>
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
                            onClick={() => onDeleteUser(user.id)}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isDeleting}
                          >
                            {isDeleting ? t('users.deleting') : t('users.deleteUser')}
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

      <EditUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      />
    </>
  );
}
