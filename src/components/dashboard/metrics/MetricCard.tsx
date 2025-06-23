
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '../AnimatedCounter';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function MetricCard({ title, value, icon: Icon, color, bgColor, borderColor }: MetricCardProps) {
  return (
    <Card className={`${borderColor} ${bgColor} hover:shadow-card transition-shadow duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <AnimatedCounter 
                value={typeof value === 'string' ? value : value} 
                className={`text-2xl font-bold ${color}`}
              />
              <Badge 
                variant="secondary" 
                className="text-xs bg-background/50 text-muted-foreground animate-pulse"
              >
                LIVE
              </Badge>
            </div>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
