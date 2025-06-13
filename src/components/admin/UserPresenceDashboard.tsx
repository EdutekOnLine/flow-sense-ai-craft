
import React from 'react';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Users, Wifi, WifiOff, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function UserPresenceDashboard() {
  const { allUserPresence, isRootUser } = useUserPresence();
  const { t } = useTranslation();

  if (!isRootUser) {
    return null;
  }

  const onlineUsers = allUserPresence.filter(user => user.is_online);
  const offlineUsers = allUserPresence.filter(user => !user.is_online);

  const formatLastSeen = (lastSeen: string) => {
    try {
      return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getUserDisplayName = (user: any) => {
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`;
    }
    return user.profile?.email || 'Unknown User';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'root': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          Real-time User Presence
          <Badge variant="secondary" className="ml-auto">
            {onlineUsers.length} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-green-700 mb-3">
              <Wifi className="h-4 w-4" />
              Currently Online ({onlineUsers.length})
            </h4>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.profile?.role || 'employee')}>
                      {(user.profile?.role || 'employee').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Users */}
        {offlineUsers.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
              <WifiOff className="h-4 w-4" />
              Recently Offline ({offlineUsers.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {offlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-700">
                        {getUserDisplayName(user)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(user.profile?.role || 'employee')}>
                      {(user.profile?.role || 'employee').toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastSeen(user.last_seen)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {allUserPresence.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No user presence data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
