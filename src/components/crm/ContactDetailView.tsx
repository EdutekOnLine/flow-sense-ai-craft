
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MessageSquare,
  Star,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { CrmContact } from '@/modules/neura-crm';
import { CommunicationLogDialog } from './CommunicationLogDialog';
import { CommunicationTimeline } from './CommunicationTimeline';
import { CommunicationMetrics } from './CommunicationMetrics';
import { format } from 'date-fns';

interface ContactDetailViewProps {
  contact: CrmContact & {
    companies?: { name: string };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDetailView({ contact, isOpen, onClose }: ContactDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!contact) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      prospect: 'bg-yellow-100 text-yellow-800',
      customer: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {contact.first_name} {contact.last_name}
                </h2>
                {contact.job_title && (
                  <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                )}
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(contact.status)}>
                {contact.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Contact
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="h-4 w-4 mr-2" />
                    Mark as Favorite
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  )}
                  {contact.companies && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.companies.name}</span>
                    </div>
                  )}
                  {contact.department && (
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{contact.department}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lead Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Lead Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.min(contact.lead_score, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{contact.lead_score}</span>
                    </div>
                  </div>
                  {contact.lead_source && (
                    <div>
                      <p className="text-sm font-medium">Lead Source</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {contact.lead_source.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                  {contact.last_contact_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Contact</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(contact.last_contact_date), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {contact.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{contact.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Communication History</h3>
              <CommunicationLogDialog 
                contactId={contact.id}
                companyId={contact.company_id || undefined}
                trigger={
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Log Communication
                  </Button>
                }
              />
            </div>
            <CommunicationTimeline 
              entityId={contact.id} 
              entityType="contact" 
            />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Activity tracking coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <h3 className="text-lg font-semibold">Communication Metrics</h3>
            <CommunicationMetrics 
              entityId={contact.id} 
              entityType="contact" 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
