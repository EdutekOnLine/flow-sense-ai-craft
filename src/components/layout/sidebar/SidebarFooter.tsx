
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { SidebarFooter, SidebarSeparator } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle } from 'lucide-react';

interface DynamicSidebarFooterProps {
  onSignOut: () => void;
}

export function DynamicSidebarFooter({ onSignOut }: DynamicSidebarFooterProps) {
  const { profile } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.first_name || profile?.email}
            </p>
            <Badge variant="outline" className="text-xs">
              {profile?.role?.toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('header.signOut')}
        </Button>
      </SidebarFooter>
    </>
  );
}
