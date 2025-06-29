
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  DollarSign,
  MessageSquare,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Company } from '@/modules/neura-crm';
import { CommunicationLogDialog } from './CommunicationLogDialog';
import { CommunicationTimeline } from './CommunicationTimeline';
import { CommunicationMetrics } from './CommunicationMetrics';

interface CompanyDetailViewProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyDetailView({ company, isOpen, onClose }: CompanyDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{company.name}</h2>
                {company.industry && (
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                )}
              </div>
            </DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{company.phone}</span>
                    </div>
                  )}
                  {(company.address || company.city || company.state) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {company.address && <div>{company.address}</div>}
                        <div>
                          {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.employee_count && (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Employees</p>
                        <p className="text-sm text-muted-foreground">{company.employee_count}</p>
                      </div>
                    </div>
                  )}
                  {company.annual_revenue && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Annual Revenue</p>
                        <p className="text-sm text-muted-foreground">
                          ${(company.annual_revenue / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {company.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{company.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Communication History</h3>
              <CommunicationLogDialog 
                contactId=""
                companyId={company.id}
                trigger={
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Log Communication
                  </Button>
                }
              />
            </div>
            <CommunicationTimeline 
              entityId={company.id} 
              entityType="company" 
            />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <h3 className="text-lg font-semibold">Company Contacts</h3>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Contact management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <h3 className="text-lg font-semibold">Communication Metrics</h3>
            <CommunicationMetrics 
              entityId={company.id} 
              entityType="company" 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
