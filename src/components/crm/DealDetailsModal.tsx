
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, User, Building2, Clock, Target } from 'lucide-react';
import type { CrmDeal, CrmDealActivity } from '@/modules/neura-crm';
import { format } from 'date-fns';

interface DealDetailsModalProps {
  deal: CrmDeal & {
    crm_contacts?: { first_name: string; last_name: string; email: string };
    companies?: { name: string };
    profiles?: { first_name: string; last_name: string };
  } | null;
  activities: (CrmDealActivity & {
    profiles?: { first_name: string; last_name: string };
  })[];
  isOpen: boolean;
  onClose: () => void;
}

export function DealDetailsModal({ deal, activities, isOpen, onClose }: DealDetailsModalProps) {
  if (!deal) return null;

  const dealActivities = activities.filter(activity => activity.deal_id === deal.id);

  const getStageColor = (stage: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-indigo-100 text-indigo-800',
      proposal: 'bg-orange-100 text-orange-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {deal.title}
            <Badge className={getStageColor(deal.stage)}>
              {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deal Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Deal Value</p>
                  <p className="text-lg font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: deal.currency || 'USD',
                    }).format(deal.value)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="font-medium">{deal.probability}%</p>
                </div>
              </div>

              {deal.source && (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium capitalize">{deal.source.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {deal.crm_contacts && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">
                      {deal.crm_contacts.first_name} {deal.crm_contacts.last_name}
                    </p>
                    {deal.crm_contacts.email && (
                      <p className="text-sm text-muted-foreground">{deal.crm_contacts.email}</p>
                    )}
                  </div>
                </div>
              )}

              {deal.companies && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{deal.companies.name}</p>
                  </div>
                </div>
              )}

              {deal.expected_close_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Close Date</p>
                    <p className="font-medium">
                      {format(new Date(deal.expected_close_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {deal.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{deal.description}</p>
            </div>
          )}

          {deal.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{deal.notes}</p>
            </div>
          )}

          <Separator />

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <h4 className="font-medium">Activity Timeline</h4>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dealActivities.length > 0 ? (
                dealActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {activity.profiles && (
                          <span className="text-xs text-muted-foreground">
                            by {activity.profiles.first_name} {activity.profiles.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activities recorded yet
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
