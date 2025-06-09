
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ExportConfig {
  format: string;
  includeCharts: boolean;
  includeRawData: boolean;
  compressed: boolean;
  schedule: string;
  emailRecipients: string;
}

interface ReportExportOptionsProps {
  onExport: (config: ExportConfig) => void;
  isExporting?: boolean;
}

export default function ReportExportOptions({ onExport, isExporting = false }: ReportExportOptionsProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    compressed: false,
    schedule: 'none',
    emailRecipients: '',
  });

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', description: 'Best for sharing and printing' },
    { value: 'excel', label: 'Excel Spreadsheet', description: 'Editable data with formatting' },
    { value: 'csv', label: 'CSV File', description: 'Raw data for analysis' },
    { value: 'json', label: 'JSON Data', description: 'Structured data format' },
  ];

  const scheduleOptions = [
    { value: 'none', label: 'One-time export' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const handleExport = () => {
    onExport(config);
    toast.success(`Exporting report as ${config.format.toUpperCase()}...`);
  };

  const updateConfig = (key: keyof ExportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>Configure how you want to export your report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <div
                  key={format.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateConfig('format', format.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{format.label}</p>
                      <p className="text-sm text-gray-500">{format.description}</p>
                    </div>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div className="space-y-4">
            <Label>Content Options</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Charts & Visualizations</Label>
                  <p className="text-sm text-gray-500">Export visual charts and graphs</p>
                </div>
                <Switch
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => updateConfig('includeCharts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Raw Data</Label>
                  <p className="text-sm text-gray-500">Add data tables and appendix</p>
                </div>
                <Switch
                  checked={config.includeRawData}
                  onCheckedChange={(checked) => updateConfig('includeRawData', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compress Output</Label>
                  <p className="text-sm text-gray-500">Create ZIP archive for large files</p>
                </div>
                <Switch
                  checked={config.compressed}
                  onCheckedChange={(checked) => updateConfig('compressed', checked)}
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule (Optional)
            </Label>
            <Select value={config.schedule} onValueChange={(value) => updateConfig('schedule', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <Badge variant="outline">{config.format.toUpperCase()}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Charts:</span>
              <span>{config.includeCharts ? 'Included' : 'Excluded'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Raw Data:</span>
              <span>{config.includeRawData ? 'Included' : 'Excluded'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Schedule:</span>
              <span className="capitalize">{config.schedule === 'none' ? 'One-time' : config.schedule}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
