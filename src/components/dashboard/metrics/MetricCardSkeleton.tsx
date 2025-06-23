
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function MetricCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-8"></div>
          </div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
