
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function EmptyReportsState() {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Reports Available
        </h3>
        <p className="text-muted-foreground mb-4">
          Activate modules to access predefined reports for your workspace.
        </p>
      </CardContent>
    </Card>
  );
}
