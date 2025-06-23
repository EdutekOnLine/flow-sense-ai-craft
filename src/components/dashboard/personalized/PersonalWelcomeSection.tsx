
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useUserActivity } from '@/hooks/useUserActivity';
import { 
  User, 
  Clock, 
  Building2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PersonalWelcomeSection() {
  const { profile } = useAuth();
  const { workspaceInfo, presenceInfo, isLoading } = useUserActivity();

  if (!profile) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || profile.email.charAt(0).toUpperCase();
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'root': return 'bg-role-root text-role-root-foreground';
      case 'admin': return 'bg-role-admin text-role-admin-foreground';
      case 'manager': return 'bg-role-manager text-role-manager-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fullName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.first_name || profile.email.split('@')[0];

  const timeSinceJoining = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true });

  return (
    <Card className="border-2 border-primary/20 bg-gradient-theme-primary">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold border border-border shadow-card">
              {getInitials(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl text-foreground mb-1">
              {getGreeting()}, {fullName}!
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getRoleBadgeClasses(profile.role)}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
              {presenceInfo?.is_online && (
                <Badge className="bg-status-online text-white">
                  Online
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Department Info */}
          {profile.department && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">{profile.department}</span>
            </div>
          )}
          
          {/* Workspace Info */}
          {workspaceInfo && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">{workspaceInfo.name}</span>
            </div>
          )}
          
          {/* Member Since */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Joined {timeSinceJoining}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
