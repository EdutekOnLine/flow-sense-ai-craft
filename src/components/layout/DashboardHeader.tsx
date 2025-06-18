
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

interface DashboardHeaderProps {
  isMainDashboard: boolean;
  isRTL: boolean;
}

export function DashboardHeader({ isMainDashboard, isRTL }: DashboardHeaderProps) {
  return (
    <header className="bg-gradient-theme-primary shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${isRTL ? 'rtl-space-reverse' : ''}`}>
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isMainDashboard && <SidebarTrigger className="mr-4" />}
            <a 
              href="https://neuracore.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center hover:opacity-80 transition-opacity cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <img 
                src="/lovable-uploads/ad638155-e549-4473-9b1c-09e58275fae6.png" 
                alt="NeuraCore Logo" 
                className={`h-8 w-auto ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
            </a>
          </div>
          <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
            <LanguageSwitcher />
            <NotificationCenter />
          </div>
        </div>
      </div>
    </header>
  );
}
