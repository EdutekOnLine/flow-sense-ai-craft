
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';

export function DynamicSidebarHeader() {
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/1296f80e-407f-41a9-837c-3a1f9cca1c8a.png" 
          alt="Neuracore 360" 
          className="h-8 w-auto"
        />
      </div>
    </SidebarHeader>
  );
}
