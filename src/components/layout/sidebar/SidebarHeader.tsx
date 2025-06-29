
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';

export function DynamicSidebarHeader() {
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/89265bda-97be-4333-b30d-5e5f3fd6aa89.png" 
          alt="Neuracore 360" 
          className="h-8 w-auto"
        />
      </div>
    </SidebarHeader>
  );
}
