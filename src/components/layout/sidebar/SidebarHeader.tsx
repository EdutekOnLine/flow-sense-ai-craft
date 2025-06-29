
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';

export function DynamicSidebarHeader() {
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/ad638155-e549-4473-9b1c-09e58275fae6.png" 
          alt="NeuraCore" 
          className="h-8 w-auto"
        />
      </div>
    </SidebarHeader>
  );
}
