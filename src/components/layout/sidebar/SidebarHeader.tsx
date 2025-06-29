
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';

export function DynamicSidebarHeader() {
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/27d218d0-0e7d-4d1f-9f0d-20e489109cdc.png" 
          alt="Neuracore 360" 
          className="h-8 w-auto"
        />
      </div>
    </SidebarHeader>
  );
}
