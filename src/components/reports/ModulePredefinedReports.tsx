
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { getRTLAwareTextAlign } from '@/utils/rtl';
import { MODULE_REPORTS } from './constants/predefinedReports';
import { PredefinedReportCard } from './PredefinedReportCard';
import { EmptyReportsState } from './EmptyReportsState';
import { UnavailableReportsSection } from './UnavailableReportsSection';

export function ModulePredefinedReports() {
  const { t } = useTranslation();
  const { activeModules, canManageModules, getModuleDisplayName } = useModulePermissions();
  
  const isRootUser = canManageModules();
  
  // Filter reports based on active modules
  const availableReports = MODULE_REPORTS.filter(report =>
    isRootUser || report.requiredModules.some(moduleId => activeModules.includes(moduleId))
  );
  
  const unavailableReports = MODULE_REPORTS.filter(report =>
    !isRootUser && !report.requiredModules.some(moduleId => activeModules.includes(moduleId))
  );

  // Group available reports by category
  const groupedReports = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, typeof MODULE_REPORTS>);

  const generateReport = (reportId: string) => {
    console.log('Generating predefined report:', reportId);
    // This would trigger the predefined report generation
  };

  const getModuleBadgeColor = (moduleId: string) => {
    const colors: Record<string, string> = {
      'neura-core': 'bg-blue-100 text-blue-800 border-blue-200',
      'neura-flow': 'bg-purple-100 text-purple-800 border-purple-200',
      'neura-crm': 'bg-green-100 text-green-800 border-green-200',
      'neura-forms': 'bg-orange-100 text-orange-800 border-orange-200',
      'neura-edu': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[moduleId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Available Reports */}
      {Object.keys(groupedReports).length > 0 ? (
        Object.entries(groupedReports).map(([category, reports]) => (
          <div key={category} className="space-y-4">
            <h3 className={`text-lg font-semibold text-foreground ${getRTLAwareTextAlign('start')}`}>
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <PredefinedReportCard
                  key={report.id}
                  report={report}
                  onGenerate={generateReport}
                  getModuleDisplayName={getModuleDisplayName}
                  getModuleBadgeColor={getModuleBadgeColor}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <EmptyReportsState />
      )}

      {/* Unavailable Reports Section */}
      {!isRootUser && (
        <UnavailableReportsSection
          unavailableReports={unavailableReports}
          getModuleDisplayName={getModuleDisplayName}
          getModuleBadgeColor={getModuleBadgeColor}
        />
      )}
    </div>
  );
}
