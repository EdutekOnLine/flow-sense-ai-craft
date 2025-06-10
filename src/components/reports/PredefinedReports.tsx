
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
      <div className={`text-center ${getRTLAwareTextAlign('center')}`}>
        <h2 className="text-2xl font-bold mb-2">{t('reports.predefinedReports')}</h2>
        <p className="text-gray-600">{t('reports.predefinedDescription')}</p>
      </div>

      {predefinedReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('reports.noPredefinedReports')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('reports.predefinedReportsWillBeAdded')}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedReports).map(([category, reports]) => (
          <div key={category} className="space-y-4">
            <h3 className={`text-lg font-semibold text-gray-800 ${getRTLAwareTextAlign('start')}`}>{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report: any) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
                        <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse`}>
                          <Icon className="h-5 w-5 text-blue-600" />
                          <CardTitle className={`text-lg ${getRTLAwareTextAlign('start')}`}>{report.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {report.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className={`text-sm text-gray-600 ${getRTLAwareTextAlign('start')}`}>{report.description}</p>
                      <div className={`flex justify-between items-center rtl:flex-row-reverse`}>
                        <span className={`text-xs text-gray-500 ${getRTLAwareTextAlign('start')}`}>
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
  );
}
