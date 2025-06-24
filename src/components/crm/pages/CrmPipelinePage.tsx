
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCrmData } from '@/hooks/useCrmData';
import { TrendingUp, Plus, DollarSign, Users, Target, Calendar } from 'lucide-react';

export function CrmPipelinePage() {
  const { contacts, metrics, isLoading } = useCrmData();

  const pipelineStages = [
    { 
      name: 'Leads', 
      contacts: contacts.filter(c => c.status === 'lead'),
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      name: 'Prospects', 
      contacts: contacts.filter(c => c.status === 'prospect'),
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      name: 'Customers', 
      contacts: contacts.filter(c => c.status === 'customer'),
      color: 'bg-green-100 text-green-800'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track your sales opportunities and conversion funnel</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold">{metrics.activeDeals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New This Week</p>
                <p className="text-2xl font-bold">{metrics.newContactsThisWeek}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pipelineStages.map((stage, index) => (
          <Card key={stage.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{stage.name}</CardTitle>
                <Badge className={stage.color}>
                  {stage.contacts.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stage.contacts.slice(0, 10).map((contact) => (
                <div key={contact.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.companies && (
                          <p className="text-xs text-muted-foreground">
                            {contact.companies.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Score:</span>
                        <span className="font-medium">{contact.lead_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {stage.contacts.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{stage.contacts.length - 10} more
                </div>
              )}
              
              {stage.contacts.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No {stage.name.toLowerCase()} yet
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {pipelineStages.map((stage, index) => (
              <React.Fragment key={stage.name}>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${stage.color} flex items-center justify-center mb-2`}>
                    <span className="text-lg font-bold">{stage.contacts.length}</span>
                  </div>
                  <p className="text-sm font-medium">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contacts.length > 0 ? Math.round((stage.contacts.length / contacts.length) * 100) : 0}%
                  </p>
                </div>
                {index < pipelineStages.length - 1 && (
                  <div className="flex-1 h-px bg-border mx-4"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
