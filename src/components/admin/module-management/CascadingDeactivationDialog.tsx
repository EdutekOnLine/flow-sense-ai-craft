
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowDown,
  Loader2
} from 'lucide-react';
import { useDependencyGraph } from '@/hooks/useDependencyGraph';

interface CascadingDeactivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulesToDeactivate: string[];
  moduleDisplayNames: Record<string, string>;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function CascadingDeactivationDialog({
  open,
  onOpenChange,
  modulesToDeactivate,
  moduleDisplayNames,
  onConfirm,
  onCancel
}: CascadingDeactivationDialogProps) {
  const { getDependencyConflicts, canSafelyDeactivate } = useDependencyGraph();
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    if (open && modulesToDeactivate.length > 0) {
      analyzeDeactivation();
    }
  }, [open, modulesToDeactivate]);

  const analyzeDeactivation = async () => {
    setLoading(true);
    setAnalysisComplete(false);
    
    try {
      const conflictData = await getDependencyConflicts(modulesToDeactivate);
      setConflicts(conflictData);
    } catch (error) {
      console.error('Failed to analyze deactivation:', error);
    } finally {
      setLoading(false);
      setAnalysisComplete(true);
    }
  };

  const isSafeToDeactivate = canSafelyDeactivate(modulesToDeactivate);
  const hasConflicts = conflicts.length > 0;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Module Deactivation Analysis
          </AlertDialogTitle>
          <AlertDialogDescription>
            Analyzing the impact of deactivating the selected modules on your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Modules to be deactivated */}
          <div>
            <h4 className="text-sm font-medium mb-2">Modules to Deactivate:</h4>
            <div className="flex flex-wrap gap-2">
              {modulesToDeactivate.map(moduleName => (
                <Badge key={moduleName} variant="destructive">
                  {moduleDisplayNames[moduleName] || moduleName}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Analysis status */}
          {loading && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Analyzing dependency conflicts...
              </span>
            </div>
          )}

          {/* Analysis results */}
          {analysisComplete && (
            <div className="space-y-4">
              {/* Safety status */}
              <Alert className={isSafeToDeactivate ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {isSafeToDeactivate ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={isSafeToDeactivate ? 'text-green-800' : 'text-red-800'}>
                    {isSafeToDeactivate ? (
                      'Safe to deactivate - No dependency conflicts detected.'
                    ) : (
                      `Cannot safely deactivate - ${conflicts.length} conflict${conflicts.length !== 1 ? 's' : ''} detected.`
                    )}
                  </AlertDescription>
                </div>
              </Alert>

              {/* Conflicts list */}
              {hasConflicts && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Dependency Conflicts
                  </h4>
                  <div className="space-y-3">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-sm">{conflict.display_name}</div>
                            <div className="text-xs text-muted-foreground">
                              Module: {conflict.affected_module}
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            Level {conflict.impact_level}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Issue:</strong> {conflict.conflict_type.replace('_', ' ').toLowerCase()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <strong>Solution:</strong> {conflict.suggested_action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deactivation order */}
              {!hasConflicts && modulesToDeactivate.length > 1 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Recommended Deactivation Order:</h4>
                  <div className="space-y-2">
                    {[...modulesToDeactivate].reverse().map((moduleName, index) => (
                      <div key={moduleName} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{moduleDisplayNames[moduleName] || moduleName}</span>
                        {index < modulesToDeactivate.length - 1 && (
                          <ArrowDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!analysisComplete || (!isSafeToDeactivate && hasConflicts)}
            className={hasConflicts ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {hasConflicts ? 'Force Deactivate' : 'Deactivate Modules'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
