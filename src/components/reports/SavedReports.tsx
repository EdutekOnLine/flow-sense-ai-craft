
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Play, Share, Trash2 } from 'lucide-react';
import { getRTLAwareTextAlign, getRTLAwareIconPosition } from '@/utils/rtl';

// Mock data for saved reports - cleared for fresh start
const savedReports: any[] = [];

export function SavedReports() {
  const { t } = useTranslation();

  const runReport = (reportId: string) => {
    console.log('Running saved report:', reportId);
    // This would run the saved report
  };

  const shareReport = (reportId: string) => {
    console.log('Sharing report:', reportId);
    // This would open a share dialog
  };

  const deleteReport = (reportId: string) => {
    console.log('Deleting report:', reportId);
    // This would delete the report
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('reports.savedReports')}</h2>
          <p className="text-gray-600">{t('reports.savedDescription')}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
        {savedReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('reports.noSavedReports')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('reports.createFirstReport')}
              </p>
              <Button>{t('reports.createReport')}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`flex items-start justify-between rtl:flex-row-reverse`}>
                    <div className={`space-y-1 ${getRTLAwareTextAlign('start')}`}>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                    <div className="flex space-x-1 rtl:space-x-reverse">
                      {report.isShared && (
                        <Badge variant="secondary" className="text-xs">
                          {t('reports.shared')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse ${getRTLAwareTextAlign('start')}`}>
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{report.createdBy}</span>
                    </div>
                    <div className={`flex items-center space-x-2 rtl:space-x-reverse rtl:flex-row-reverse ${getRTLAwareTextAlign('start')}`}>
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={`text-xs text-gray-500 space-y-1 ${getRTLAwareTextAlign('start')}`}>
                    <div>Data Source: {report.dataSource}</div>
                    <div>Filters: {report.filters} | Columns: {report.columns}</div>
                    <div>Last Run: {new Date(report.lastRun).toLocaleDateString()}</div>
                  </div>

                  <div className={`flex justify-between items-center pt-2 rtl:flex-row-reverse`}>
                    <div className={`flex space-x-2 rtl:space-x-reverse rtl:flex-row-reverse`}>
                      <Button 
                        size="sm"
                        onClick={() => runReport(report.id)}
                        className="rtl:flex-row-reverse"
                      >
                        <Play className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                        {t('reports.run')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareReport(report.id)}
                        className="rtl:flex-row-reverse"
                      >
                        <Share className={`h-4 w-4 ${getRTLAwareIconPosition('before')}`} />
                        {t('reports.share')}
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
