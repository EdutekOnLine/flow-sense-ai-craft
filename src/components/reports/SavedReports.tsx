
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, Play, Share, Trash2 } from 'lucide-react';

// Mock data for saved reports
const savedReports = [
  {
    id: '1',
    name: 'Q4 Workflow Performance',
    description: 'Quarterly performance analysis for all departments',
    dataSource: 'workflow_performance_analytics',
    createdBy: 'John Doe',
    createdAt: '2024-01-15',
    lastRun: '2024-01-20',
    isShared: true,
    filters: 3,
    columns: 8
  },
  {
    id: '2',
    name: 'Developer Team Productivity',
    description: 'Monthly productivity report for development team',
    dataSource: 'user_performance_analytics',
    createdBy: 'Jane Smith',
    createdAt: '2024-01-10',
    lastRun: '2024-01-18',
    isShared: false,
    filters: 2,
    columns: 6
  },
  {
    id: '3',
    name: 'Overdue Tasks Report',
    description: 'Tasks that are past their due dates',
    dataSource: 'workflow_step_assignments',
    createdBy: 'Mike Johnson',
    createdAt: '2024-01-08',
    lastRun: '2024-01-19',
    isShared: true,
    filters: 1,
    columns: 5
  }
];

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
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('reports.savedReports')}</h2>
        <p className="text-gray-600">{t('reports.savedDescription')}</p>
      </div>

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
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  <div className="flex space-x-1">
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
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{report.createdBy}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>Data Source: {report.dataSource}</div>
                  <div>Filters: {report.filters} | Columns: {report.columns}</div>
                  <div>Last Run: {new Date(report.lastRun).toLocaleDateString()}</div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      onClick={() => runReport(report.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {t('reports.run')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => shareReport(report.id)}
                    >
                      <Share className="h-4 w-4 mr-1" />
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
  );
}
