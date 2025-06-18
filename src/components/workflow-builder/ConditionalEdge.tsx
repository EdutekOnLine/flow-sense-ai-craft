
import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  EdgeProps,
  MarkerType,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface ConditionalEdgeData {
  label?: string;
  condition?: string;
}

export function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const edgeData = data as ConditionalEdgeData;
  const [labelValue, setLabelValue] = useState(edgeData?.label || '');

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const onEdgeEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const onLabelSave = () => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: { ...edge.data, label: labelValue },
            label: labelValue,
          };
        }
        return edge;
      })
    );
    setIsEditing(false);
  };

  const onLabelCancel = () => {
    setLabelValue(edgeData?.label || '');
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#6366f1',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-all transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-sm px-2 py-1 min-w-[80px]"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                className="h-6 text-xs w-16"
                placeholder="Label"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onLabelSave();
                  if (e.key === 'Escape') onLabelCancel();
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onLabelSave}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLabelCancel}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-foreground min-w-[40px] text-center">
                {edgeData?.label || 'Yes'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdgeEdit}
                className="h-5 w-5 p-0 text-muted-foreground hover:text-primary"
              >
                <Edit2 className="h-2.5 w-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdgeDelete}
                className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
