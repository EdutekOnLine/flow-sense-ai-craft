
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCrmDeals } from '@/hooks/useCrmDeals';
import { useCrmData } from '@/hooks/useCrmData';
import { Plus, DollarSign, Target, TrendingUp, Calendar } from 'lucide-react';
import { DealCard } from '@/components/crm/DealCard';
import { DealDetailsModal } from '@/components/crm/DealDetailsModal';
import { CreateDealDialog } from '@/components/crm/CreateDealDialog';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CrmDeal } from '@/modules/neura-crm';

const DEAL_STAGES = [
  { key: 'lead', name: 'Leads', color: 'bg-blue-100 text-blue-800' },
  { key: 'contacted', name: 'Contacted', color: 'bg-purple-100 text-purple-800' },
  { key: 'qualified', name: 'Qualified', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'proposal', name: 'Proposal', color: 'bg-orange-100 text-orange-800' },
  { key: 'negotiation', name: 'Negotiation', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'won', name: 'Won', color: 'bg-green-100 text-green-800' },
  { key: 'lost', name: 'Lost', color: 'bg-red-100 text-red-800' },
] as const;

interface SortableDealCardProps {
  deal: CrmDeal & {
    crm_contacts?: { first_name: string; last_name: string; email: string };
    companies?: { name: string };
    profiles?: { first_name: string; last_name: string };
  };
  onClick: () => void;
}

function SortableDealCard({ deal, onClick }: SortableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

export function CrmPipelinePage() {
  const { deals, dealActivities, isLoading, createDeal, moveDeal, isCreating } = useCrmDeals();
  const { metrics } = useCrmData();
  const [selectedDeal, setSelectedDeal] = useState<typeof deals[0] | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeDeal, setActiveDeal] = useState<typeof deals[0] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Calculate pipeline metrics
  const pipelineMetrics = {
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
    weightedValue: deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0),
    averageDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0,
    wonDeals: deals.filter(deal => deal.stage === 'won').length,
    lostDeals: deals.filter(deal => deal.stage === 'lost').length,
  };

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as CrmDeal['stage'];
    const deal = deals.find(d => d.id === dealId);

    if (deal && deal.stage !== newStage) {
      moveDeal({ dealId, newStage });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
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
          <p className="text-muted-foreground">Manage your deals and track sales progress</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Deal
        </Button>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold">
                  ${pipelineMetrics.totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weighted Pipeline</p>
                <p className="text-2xl font-bold">
                  ${pipelineMetrics.weightedValue.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{pipelineMetrics.totalDeals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">
                  ${pipelineMetrics.averageDealSize.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = deals.filter(deal => deal.stage === stage.key);
            const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

            return (
              <SortableContext
                key={stage.key}
                id={stage.key}
                items={stageDeals.map(deal => deal.id)}
                strategy={verticalListSortingStrategy}
              >
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{stage.name}</CardTitle>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${stage.color}`}>
                        {stageDeals.length}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${stageValue.toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent 
                    className="space-y-3 min-h-[400px] border-2 border-dashed border-transparent transition-colors"
                    style={{ 
                      borderColor: activeDeal && activeDeal.stage !== stage.key ? '#e2e8f0' : 'transparent' 
                    }}
                  >
                    {stageDeals.map((deal) => (
                      <SortableDealCard
                        key={deal.id}
                        deal={deal}
                        onClick={() => setSelectedDeal(deal)}
                      />
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        No deals in {stage.name.toLowerCase()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <DealCard 
              deal={activeDeal} 
              onClick={() => {}} 
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <DealDetailsModal
        deal={selectedDeal}
        activities={dealActivities}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />

      <CreateDealDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={createDeal}
        isCreating={isCreating}
      />
    </div>
  );
}
