
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { PredefinedReportCard } from './PredefinedReportCard';
import { PredefinedReport } from './constants/predefinedReports';

interface UnavailableReportsSectionProps {
  unavailableReports: PredefinedReport[];
  getModuleDisplayName: (moduleId: string) => string;
  getModuleBadgeColor: (moduleId: string) => string;
}

export function UnavailableReportsSection({
  unavailableReports,
  getModuleDisplayName,
  getModuleBadgeColor
}: UnavailableReportsSectionProps) {
  if (unavailableReports.length === 0) {
    return null;
  }

  const handleUnavailableGenerate = () => {
    // No-op for unavailable reports
  };

  return (
    <div className="space-y-4">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-2">
            <p className="font-medium">Additional Reports Available</p>
            <p className="text-sm">
              Activate additional modules to access {unavailableReports.length} more predefined reports.
            </p>
          </div>
        </AlertDescription>
      </Alert>
      
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          View unavailable reports ({unavailableReports.length})
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 opacity-60">
          {unavailableReports.map((report) => (
            <PredefinedReportCard
              key={report.id}
              report={report}
              onGenerate={handleUnavailableGenerate}
              getModuleDisplayName={getModuleDisplayName}
              getModuleBadgeColor={getModuleBadgeColor}
              isAvailable={false}
            />
          ))}
        </div>
      </details>
    </div>
  );
}
