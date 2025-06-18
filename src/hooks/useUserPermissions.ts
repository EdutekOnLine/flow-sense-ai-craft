
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee' | 'root';
  department?: string;
  created_at: string;
}

export function useUserPermissions() {
  const { profile } = useAuth();

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'root': return 'bg-role-root text-role-root-foreground';
      case 'admin': return 'bg-role-admin text-role-admin-foreground';
      case 'manager': return 'bg-role-manager text-role-manager-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return {
    canEditUser,
    canDeleteUser,
    canSeeUser,
    canInviteUsers,
    getRoleBadgeColor,
    isManagerRole: profile?.role === 'manager',
  };
}
