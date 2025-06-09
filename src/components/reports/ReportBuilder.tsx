
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Calendar, FileText, Download, Filter, Settings, Brain, BarChart3, LineChart, PieChart, Activity } from 'lucide-react';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import ReportBuilderPreview from './ReportBuilderPreview';
import ReportExportOptions from './ReportExportOptions';
import { toast } from 'sonner';

interface ReportConfig {
  name: string;
  type: string;
  visualization: string;
  dateRange: DateRange | undefined;
  filters: Record<string, string>;
  departments: string[];
  users: string[];
  groupBy: string;
}

export default function ReportBuilder() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: 'performance',
    visualization: '',
    dateRange: {
      from: addDays(new Date(), -30),
      to: new Date(),
    },
    filters: {},
    departments: [],
    users: [],
    groupBy: 'department',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    { value: 'performance', label: 'Performance Report' },
    { value: 'audit', label: 'Audit & Compliance Report' },
    { value: 'executive', label: 'Executive Summary' },
    { value: 'resource', label: 'Resource Utilization' },
    { value: 'predictive', label: 'Predictive Analytics' },
  ];

  const visualizationTypes = [
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
    { value: 'table', label: 'Data Table', icon: <Activity className="h-4 w-4" /> },
  ];

  const groupByOptions = [
    { value: 'department', label: 'Department' },
    { value: 'user', label: 'User' },
    { value: 'workflow', label: 'Workflow Type' },
    { value: 'date', label: 'Date Period' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (exportConfig: any) => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create mock download
      const filename = `${config.name || 'report'}-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
      const mockData = JSON.stringify({ config, exportConfig, generatedAt: new Date().toISOString() }, null, 2);
      const blob = new Blob([mockData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${exportConfig.format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const updateConfig = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Builder</h2>
          <p className="text-gray-600 mt-1">Create custom reports with advanced visualizations</p>
        </div>
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Brain className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visualization
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>Set up the basic parameters for your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    placeholder="Enter report name"
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select 
                    value={config.type} 
                    onValueChange={(value) => updateConfig('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <DatePickerWithRange
                  date={config.dateRange}
                  onDateChange={(dateRange) => updateConfig('dateRange', dateRange)}
                />
              </div>

              <div className="space-y-2">
                <Label>Group By</Label>
                <Select value={config.groupBy} onValueChange={(value) => updateConfig('groupBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupByOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualization Options</CardTitle>
              <CardDescription>Choose how to display your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visualizationTypes.map((viz) => (
                  <div
                    key={viz.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.visualization === viz.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateConfig('visualization', viz.value)}
                  >
                    <div className="text-center">
                      <div className="mb-2 flex justify-center">{viz.icon}</div>
                      <p className="text-sm font-medium">{viz.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <ReportBuilderPreview config={config} />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ReportExportOptions 
            onExport={handleExportReport}
            isExporting={isExporting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
