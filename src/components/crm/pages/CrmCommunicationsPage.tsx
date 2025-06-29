
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Download, Plus, BarChart3 } from 'lucide-react';
import { useCrmCommunications } from '@/hooks/useCrmCommunications';
import { CommunicationTimeline } from '../CommunicationTimeline';
import { CommunicationFilters, type CommunicationFilter } from '../CommunicationFilters';
import { CommunicationLogDialog } from '../CommunicationLogDialog';
import { CommunicationMetrics } from '../CommunicationMetrics';

export function CrmCommunicationsPage() {
  const { communications, isLoading } = useCrmCommunications();
  const [filters, setFilters] = useState<CommunicationFilter>({
    search: '',
    type: 'all',
    creator: 'all'
  });
  const [showMetrics, setShowMetrics] = useState(false);

  // Get unique creators for filter
  const creators = Array.from(new Set(communications.map(c => c.created_by)))
    .map(id => ({
      id,
      name: communications.find(c => c.created_by === id)?.creator 
        ? `${communications.find(c => c.created_by === id)?.creator?.first_name} ${communications.find(c => c.created_by === id)?.creator?.last_name}`.trim()
        : 'Unknown'
    }));

  // Filter communications based on current filters
  const filteredCommunications = communications.filter(comm => {
    if (filters.search && !comm.summary?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type !== 'all' && comm.type !== filters.type) {
      return false;
    }
    if (filters.creator !== 'all' && comm.created_by !== filters.creator) {
      return false;
    }
    if (filters.dateFrom && new Date(comm.communication_date) < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && new Date(comm.communication_date) > filters.dateTo) {
      return false;
    }
    return true;
  });

  const exportCommunications = () => {
    const csvContent = [
      ['Date', 'Type', 'Summary', 'Outcome', 'Contact', 'Company', 'Creator'],
      ...filteredCommunications.map(comm => [
        new Date(comm.communication_date).toLocaleDateString(),
        comm.type,
        comm.summary || '',
        comm.outcome || '',
        comm.contact ? `${comm.contact.first_name} ${comm.contact.last_name}` : '',
        comm.company?.name || '',
        comm.creator ? `${comm.creator.first_name} ${comm.creator.last_name}` : ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded animate-pulse"></div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">
            Track and manage all customer communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showMetrics ? "default" : "outline"} 
            onClick={() => setShowMetrics(!showMetrics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
          </Button>
          <Button variant="outline" onClick={exportCommunications}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <CommunicationLogDialog 
            contactId=""
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Communication
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communications.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredCommunications.length} after filters
            </p>
          </CardContent>
        </Card>

        {['call', 'email', 'meeting', 'note'].map(type => {
          const count = communications.filter(c => c.type === type).length;
          const filteredCount = filteredCommunications.filter(c => c.type === type).length;
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{type}s</CardTitle>
                <Badge variant="outline">{count}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((filteredCount / Math.max(count, 1)) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metrics Section */}
      {showMetrics && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Communication Analytics</h2>
          <CommunicationMetrics entityId="" entityType="contact" />
        </div>
      )}

      {/* Filters */}
      <CommunicationFilters
        filters={filters}
        onFiltersChange={setFilters}
        creators={creators}
      />

      {/* Communications Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Timeline
            <Badge variant="outline" className="ml-auto">
              {filteredCommunications.length} communications
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommunicationTimeline showFilters={false} />
        </CardContent>
      </Card>
    </div>
  );
}
