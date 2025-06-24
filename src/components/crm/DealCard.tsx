
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User, Building2 } from 'lucide-react';
import type { CrmDeal } from '@/modules/neura-crm';
import { format } from 'date-fns';

interface DealCardProps {
  deal: CrmDeal & {
    crm_contacts?: { first_name: string; last_name: string; email: string };
    companies?: { name: string };
    profiles?: { first_name: string; last_name: string };
  };
  onClick: () => void;
  isDragging?: boolean;
}

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-100 text-green-800';
    if (probability >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

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
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm line-clamp-2">{deal.title}</h4>
          <Badge className={getProbabilityColor(deal.probability)} variant="secondary">
            {deal.probability}%
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
          <DollarSign className="h-4 w-4" />
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: deal.currency || 'USD',
            minimumFractionDigits: 0,
          }).format(deal.value)}
        </div>

        {(deal.crm_contacts || deal.companies) && (
          <div className="space-y-1">
            {deal.crm_contacts && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{deal.crm_contacts.first_name} {deal.crm_contacts.last_name}</span>
              </div>
            )}
            {deal.companies && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{deal.companies.name}</span>
              </div>
            )}
          </div>
        )}

        {deal.expected_close_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Close: {format(new Date(deal.expected_close_date), 'MMM dd, yyyy')}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge className={getStageColor(deal.stage)} variant="outline">
            {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
          </Badge>
          {deal.profiles && (
            <span className="text-xs text-muted-foreground">
              {deal.profiles.first_name} {deal.profiles.last_name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
