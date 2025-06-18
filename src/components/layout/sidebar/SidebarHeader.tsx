
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';

export function DynamicSidebarHeader() {
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/ad638155-e549-4473-9b1c-09e58275fae6.png" 
          alt="NeuraCore" 
          className="h-8 w-auto"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">NeuraCore</span>
          <span className="text-xs text-muted-foreground">Workspace</span>
        </div>
      </div>
    </SidebarHeader>
  );
}
