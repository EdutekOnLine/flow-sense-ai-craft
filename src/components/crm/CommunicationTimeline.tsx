
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Phone, Mail, Users, FileText, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useCrmCommunications } from '@/hooks/useCrmCommunications';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAuth } from '@/hooks/useAuth';
import type { CrmCommunication } from '@/modules/neura-crm';

interface CommunicationTimelineProps {
  entityId?: string;
  entityType?: 'contact' | 'company' | 'deal';
  showFilters?: boolean;
}

export function CommunicationTimeline({ 
  entityId, 
  entityType, 
  showFilters = true 
}: CommunicationTimelineProps) {
  const { profile } = useAuth();
  const { isRootUser } = useUserPermissions();
  const { communications, isLoading, deleteCommunication } = useCrmCommunications(entityId, entityType);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');

  // Filter communications
  const filteredCommunications = communications.filter(comm => {
    if (typeFilter !== 'all' && comm.type !== typeFilter) return false;
    if (creatorFilter !== 'all' && comm.created_by !== creatorFilter) return false;
    return true;
  });

  // Get unique creators for filter
  const creators = Array.from(new Set(communications.map(c => c.created_by)))
    .map(id => ({
      id,
      name: communications.find(c => c.created_by === id)?.creator 
        ? `${communications.find(c => c.created_by === id)?.creator?.first_name} ${communications.find(c => c.created_by === id)?.creator?.last_name}`.trim()
        : 'Unknown'
    }));

  const getTypeIcon = (type: CrmCommunication['type']) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: CrmCommunication['type']) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'email': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'note': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canDeleteCommunication = (communication: CrmCommunication) => {
    return isRootUser || profile?.role === 'admin' || communication.created_by === profile?.id;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-4 mb-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">📞 Calls</SelectItem>
              <SelectItem value="email">📧 Emails</SelectItem>
              <SelectItem value="meeting">🤝 Meetings</SelectItem>
              <SelectItem value="note">📝 Notes</SelectItem>
            </SelectContent>
          </Select>

          {creators.length > 1 && (
            <Select value={creatorFilter} onValueChange={setCreatorFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {creators.map(creator => (
                  <SelectItem key={creator.id} value={creator.id}>
                    {creator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {filteredCommunications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {communications.length === 0 
                ? 'No communications logged yet'
                : 'No communications match your filters'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCommunications.map((communication, index) => (
            <Card key={communication.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeBadgeColor(communication.type)}>
                      <span className="mr-1">{getTypeIcon(communication.type)}</span>
                      {communication.type.charAt(0).toUpperCase() + communication.type.slice(1)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(communication.communication_date), 'PPp')}
                    </div>
                  </div>
                  
                  {canDeleteCommunication(communication) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => deleteCommunication(communication.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Summary</h4>
                    <p className="text-sm leading-relaxed">{communication.summary}</p>
                  </div>

                  {communication.outcome && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Outcome</h4>
                      <p className="text-sm leading-relaxed">{communication.outcome}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {communication.creator && (
                        <span>
                          By: {communication.creator.first_name} {communication.creator.last_name}
                        </span>
                      )}
                      {communication.contact && !entityType && (
                        <span>
                          Contact: {communication.contact.first_name} {communication.contact.last_name}
                        </span>
                      )}
                      {communication.company && entityType !== 'company' && (
                        <span>Company: {communication.company.name}</span>
                      )}
                      {communication.deal && entityType !== 'deal' && (
                        <span>Deal: {communication.deal.title}</span>
                      )}
                    </div>
                    <span>{format(new Date(communication.created_at), 'PPp')}</span>
                  </div>
                </div>
              </CardContent>

              {/* Timeline connector line */}
              {index < filteredCommunications.length - 1 && (
                <div className="absolute left-6 -bottom-4 w-px h-8 bg-border" />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
