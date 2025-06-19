
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Package,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useDependencyGraph } from '@/hooks/useDependencyGraph';

interface BulkOperationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModules: string[];
  operation: 'activate' | 'deactivate';
  moduleDisplayNames: Record<string, string>;
  onExecute: (modules: string[], operation: 'activate' | 'deactivate') => Promise<void>;
}

export function BulkOperationWizard({
  open,
  onOpenChange,
  selectedModules,
  operation,
  moduleDisplayNames,
  onExecute
}: BulkOperationWizardProps) {
  const { resolveActivationOrder, getDependencyConflicts } = useDependencyGraph();
  const [step, setStep] = useState(1);
  const [activationPlan, setActivationPlan] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      resetWizard();
      if (operation === 'activate') {
        planActivation();
      } else {
        checkDeactivationConflicts();
      }
    }
  }, [open, selectedModules, operation]);

  const resetWizard = () => {
    setStep(1);
    setActivationPlan([]);
    setConflicts([]);
    setExecuting(false);
    setProgress(0);
    setCompleted([]);
    setErrors([]);
  };

  const planActivation = async () => {
    try {
      const plan = await resolveActivationOrder(selectedModules);
      setActivationPlan(plan);
    } catch (error) {
      console.error('Failed to plan activation:', error);
    }
  };

  const checkDeactivationConflicts = async () => {
    try {
      const conflictData = await getDependencyConflicts(selectedModules);
      setConflicts(conflictData);
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    }
  };

  const executeOperation = async () => {
    setExecuting(true);
    setStep(2);
    
    try {
      const modulesToProcess = operation === 'activate' 
        ? activationPlan.map(item => item.module_name)
        : selectedModules;

      for (let i = 0; i < modulesToProcess.length; i++) {
        const moduleName = modulesToProcess[i];
        setProgress(((i + 1) / modulesToProcess.length) * 100);
        
        try {
          await onExecute([moduleName], operation);
          setCompleted(prev => [...prev, moduleName]);
        } catch (error) {
          console.error(`Failed to ${operation} ${moduleName}:`, error);
          setErrors(prev => [...prev, moduleName]);
        }
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setStep(3);
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setExecuting(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {operation === 'activate' ? 'Activation Plan' : 'Deactivation Analysis'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {operation === 'activate' 
                  ? 'Review the planned activation order for your selected modules.'
                  : 'Review potential conflicts before deactivating modules.'
                }
              </p>
            </div>

            {operation === 'activate' && activationPlan.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Activation Order:</h4>
                <div className="space-y-2">
                  {activationPlan.map((item, index) => (
                    <div key={item.module_name} className="flex items-center gap-3 p-2 border rounded">
                      <Badge variant="outline" className="w-8 h-6 flex items-center justify-center text-xs">
                        {item.activation_order}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.display_name}</div>
                        <div className="text-xs text-muted-foreground">{item.reason}</div>
                      </div>
                      {item.is_required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {operation === 'deactivate' && conflicts.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="space-y-2">
                    <p className="font-medium">Dependency conflicts detected:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="text-sm">
                          {conflict.display_name}: {conflict.suggested_action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {operation === 'deactivate' && conflicts.length === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  No conflicts detected. Safe to proceed with deactivation.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {operation === 'activate' ? 'Activating Modules' : 'Deactivating Modules'}
              </h3>
              <Progress value={progress} className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Progress: {completed.length + errors.length} of {operation === 'activate' ? activationPlan.length : selectedModules.length} modules processed
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(operation === 'activate' ? activationPlan : selectedModules.map(name => ({ module_name: name }))).map((item) => {
                const moduleName = item.module_name;
                const isCompleted = completed.includes(moduleName);
                const hasError = errors.includes(moduleName);
                
                return (
                  <div key={moduleName} className="flex items-center gap-2 p-2 border rounded">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : hasError ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    <span className="text-sm">
                      {moduleDisplayNames[moduleName] || moduleName}
                    </span>
                    {isCompleted && (
                      <Badge variant="default" className="text-xs ml-auto">
                        {operation === 'activate' ? 'Activated' : 'Deactivated'}
                      </Badge>
                    )}
                    {hasError && (
                      <Badge variant="destructive" className="text-xs ml-auto">
                        Failed
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Operation Complete</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-medium">{completed.length}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-lg font-medium">{errors.length}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Some modules failed to {operation}. Please check the module status and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getFooterButtons = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeOperation}
              disabled={operation === 'deactivate' && conflicts.length > 0}
            >
              {operation === 'activate' ? 'Start Activation' : 'Start Deactivation'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        );

      case 2:
        return (
          <Button variant="outline" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </Button>
        );

      case 3:
        return (
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Module {operation === 'activate' ? 'Activation' : 'Deactivation'}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? 'Planning' : step === 2 ? 'Execution' : 'Results'}
          </DialogDescription>
        </DialogHeader>

        {getStepContent()}

        <div className="flex justify-between pt-4">
          {getFooterButtons()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
