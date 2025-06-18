
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, FileText, TrendingUp, Activity, Calendar } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

const predefinedReports: any[] = [];

export function PredefinedReports() {
  const { t } = useTranslation();

  const generateReport = (reportId: string) => {
    console.log('Generating predefined report:', reportId);
    // This would trigger the predefined report generation
  };

  const groupedReports = predefinedReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, any[]>);

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
        {predefinedReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('reports.noPredefinedReports')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('reports.predefinedReportsWillBeAdded')}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedReports).map(([category, reports]: [string, any[]]) => (
            <div key={category} className="space-y-4">
              <h3 className={`text-lg font-semibold text-foreground ${getRTLAwareTextAlign('start')}`}>{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report: any) => {
                  const Icon = report.icon;
                  return (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
                          <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse`}>
                            <Icon className="h-5 w-5 text-primary" />
                            <CardTitle className={`text-lg ${getRTLAwareTextAlign('start')}`}>{report.name}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {report.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className={`text-sm text-muted-foreground ${getRTLAwareTextAlign('start')}`}>{report.description}</p>
                        <div className={`flex justify-between items-center rtl:flex-row-reverse`}>
                          <span className={`text-xs text-muted-foreground ${getRTLAwareTextAlign('start')}`}>
                            Source: {report.dataSource}
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => generateReport(report.id)}
                          >
                            {t('reports.generate')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
