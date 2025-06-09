
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Star, 
  Clock, 
  FileText,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import CollaborativeReportEditor from './CollaborativeReportEditor';
import DashboardCustomizer from './DashboardCustomizer';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'analytics' | 'executive' | 'operational' | 'custom';
  status: 'draft' | 'published' | 'archived';
  lastModified: string;
  collaborators: number;
  isStarred: boolean;
  owner: {
    name: string;
    avatar?: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  reports: Report[];
  members: number;
  isDefault: boolean;
}

export default function ReportWorkspace() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '1',
      name: 'Analytics Hub',
      description: 'Central workspace for all analytics reports',
      isDefault: true,
      members: 8,
      reports: [
        {
          id: 'r1',
          title: 'Q4 Performance Report',
          description: 'Comprehensive quarterly performance analysis',
          type: 'analytics',
          status: 'published',
          lastModified: '2 hours ago',
          collaborators: 3,
          isStarred: true,
          owner: { name: 'Alice Johnson' }
        },
        {
          id: 'r2',
          title: 'Executive Dashboard',
          description: 'High-level metrics for leadership team',
          type: 'executive',
          status: 'draft',
          lastModified: '1 day ago',
          collaborators: 2,
          isStarred: false,
          owner: { name: 'Bob Smith' }
        }
      ]
    },
    {
      id: '2',
      name: 'Operations Team',
      description: 'Operational reports and dashboards',
      isDefault: false,
      members: 5,
      reports: [
        {
          id: 'r3',
          title: 'Daily Operations Summary',
          description: 'Daily workflow performance metrics',
          type: 'operational',
          status: 'published',
          lastModified: '30 minutes ago',
          collaborators: 4,
          isStarred: true,
          owner: { name: 'Carol Davis' }
        }
      ]
    }
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = useState('1');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace);
  const filteredReports = currentWorkspace?.reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleCreateReport = () => {
    const newReport: Report = {
      id: `r${Date.now()}`,
      title: 'New Report',
      description: 'Untitled report',
      type: 'custom',
      status: 'draft',
      lastModified: 'now',
      collaborators: 1,
      isStarred: false,
      owner: { name: 'Current User' }
    };

    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === selectedWorkspace
        ? { ...workspace, reports: [newReport, ...workspace.reports] }
        : workspace
    ));

    setSelectedReport(newReport.id);
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'analytics': return 'bg-blue-100 text-blue-800';
      case 'executive': return 'bg-purple-100 text-purple-800';
      case 'operational': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If a report is selected, show the collaborative editor
  if (selectedReport) {
    const report = currentWorkspace?.reports.find(r => r.id === selectedReport);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedReport(null)}
          >
            ← Back to Workspace
          </Button>
          <h1 className="text-xl font-semibold">{report?.title}</h1>
        </div>
        <CollaborativeReportEditor 
          reportId={selectedReport}
          initialData={report}
          onSave={(data) => console.log('Saving report:', data)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Report Workspaces</h2>
          <p className="text-gray-600 mt-1">Collaborate on reports with your team</p>
        </div>
        <Button onClick={handleCreateReport}>
          <Plus className="h-4 w-4 mr-1" />
          New Report
        </Button>
      </div>

      <Tabs value={selectedWorkspace} onValueChange={setSelectedWorkspace} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            {workspaces.map((workspace) => (
              <TabsTrigger key={workspace.id} value={workspace.id} className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                {workspace.name}
                {workspace.isDefault && <Badge variant="secondary" className="ml-1">Default</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Search and Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="analytics">Analytics</option>
              <option value="executive">Executive</option>
              <option value="operational">Operational</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {workspaces.map((workspace) => (
          <TabsContent key={workspace.id} value={workspace.id} className="space-y-6">
            {/* Workspace Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5" />
                      {workspace.name}
                    </CardTitle>
                    <CardDescription>{workspace.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      <Users className="h-4 w-4 inline mr-1" />
                      {workspace.members} members
                    </div>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <Card 
                  key={report.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          {report.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(report.type)}>
                          {report.type}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {report.lastModified}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {report.collaborators}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.owner.avatar} />
                          <AvatarFallback className="text-xs">
                            {report.owner.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{report.owner.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by creating your first report'
                    }
                  </p>
                  <Button onClick={handleCreateReport}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
