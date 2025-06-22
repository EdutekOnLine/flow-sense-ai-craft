
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { ModulePredefinedReports } from './ModulePredefinedReports';
import { getRTLAwareTextAlign } from '@/utils/rtl';

export function PredefinedReports() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('reports.predefinedReports')}</h2>
          <p className="text-muted-foreground">{t('reports.predefinedDescription')}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-border">
        <ModulePredefinedReports />
      </div>
    </div>
  );
}
