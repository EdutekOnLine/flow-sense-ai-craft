
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export function EmptyModulesState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Modules</h3>
        <p className="text-muted-foreground text-center">
          Enable modules to configure their settings.
        </p>
      </CardContent>
    </Card>
  );
}
