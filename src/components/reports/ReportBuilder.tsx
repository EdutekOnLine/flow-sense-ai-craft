
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Calendar, FileText, Download, Filter, Settings, Brain } from 'lucide-react';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ReportConfig {
  name: string;
  type: string;
  dateRange: DateRange | undefined;
  filters: Record<string, string>;
  departments: string[];
  users: string[];
}

export default function ReportBuilder() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: 'performance',
    dateRange: {
      from: addDays(new Date(), -30),
      to: new Date(),
    },
    filters: {},
    departments: [],
    users: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'performance', label: 'Performance Report' },
    { value: 'audit', label: 'Audit & Compliance Report' },
    { value: 'executive', label: 'Executive Summary' },
    { value: 'resource', label: 'Resource Utilization' },
    { value: 'predictive', label: 'Predictive Analytics' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Implementation will be added when we create the edge function
    console.log('Generating report with config:', config);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Builder</h2>
          <p className="text-gray-600 mt-1">Create custom reports with AI-powered insights</p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Preview
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
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select 
                    value={config.type} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}
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
                  onDateChange={(dateRange) => setConfig(prev => ({ ...prev, dateRange }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
              <CardDescription>Customize your report with specific filters and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department Filter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status Filter</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview your report configuration before generating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Report Summary</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {config.name || 'Untitled Report'}</p>
                    <p><strong>Type:</strong> {reportTypes.find(t => t.value === config.type)?.label}</p>
                    <p><strong>Date Range:</strong> {config.dateRange?.from?.toLocaleDateString()} - {config.dateRange?.to?.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
