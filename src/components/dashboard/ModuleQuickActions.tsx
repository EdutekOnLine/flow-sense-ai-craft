
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModuleDashboardData } from '@/hooks/useModuleDashboardData';
import { 
  Plus, 
  CheckSquare, 
  UserPlus, 
  FileText, 
  BookOpen, 
  BarChart3,
  Settings,
  Users,
  Zap,
  Building2,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const iconMap = {
  Plus,
  CheckSquare,
  UserPlus,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  Users,
  Building2,
  TrendingUp
};

export function ModuleQuickActions() {
  const { data, isLoading } = useModuleDashboardData();
  const { t } = useTranslation();

  const handleAction = (action: string) => {
    window.location.hash = action;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse h-6 bg-muted rounded w-32"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.quickActions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl border border-border shadow-card">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          {t('dashboard.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.quickActions.map((action) => {
            const IconComponent = iconMap[action.icon as keyof typeof iconMap] || Settings;
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleAction(action.action)}
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-primary/5"
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
