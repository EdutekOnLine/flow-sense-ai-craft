
import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Settings, Clock, Users, Mail, Database, GitBranch, Webhook, FileText, Calendar, Filter } from 'lucide-react';

interface WorkflowNodeData {
  label: string;
  stepType: string;
  description: string;
  assignedTo: string | null;
  estimatedHours: number | null;
  // Node type specific configurations
  emailConfig?: {
    to: string;
    subject: string;
    body: string;
  };
  webhookConfig?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
  };
  conditionConfig?: {
    field: string;
    operator: string;
    value: string;
  };
  delayConfig?: {
    duration: number;
    unit: string;
  };
}

interface NodeEditorProps {
  selectedNode: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, newData: Partial<WorkflowNodeData>) => void;
  availableFields: string[];
}

const baseFormSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
});

const emailConfigSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

const webhookConfigSchema = z.object({
  url: z.string().url('Invalid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
});

const conditionConfigSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
  value: z.string().min(1, 'Value is required'),
});

const delayConfigSchema = z.object({
  duration: z.number().min(1, 'Duration must be at least 1'),
  unit: z.enum(['minutes', 'hours', 'days']),
});

export function NodeEditor({ selectedNode, isOpen, onClose, onUpdateNode, availableFields }: NodeEditorProps) {
  const [formSchema, setFormSchema] = useState(baseFormSchema);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      description: '',
      assignedTo: '',
      estimatedHours: 0,
    },
  });

  useEffect(() => {
    if (selectedNode) {
      const nodeData = selectedNode.data as WorkflowNodeData;
      
      // Update form schema based on node type
      let extendedSchema = baseFormSchema;
      if (nodeData.stepType === 'send-email') {
        extendedSchema = baseFormSchema.extend({
          emailConfig: emailConfigSchema,
        });
      } else if (nodeData.stepType === 'webhook-call') {
        extendedSchema = baseFormSchema.extend({
          webhookConfig: webhookConfigSchema,
        });
      } else if (nodeData.stepType.includes('condition') || nodeData.stepType === 'filter') {
        extendedSchema = baseFormSchema.extend({
          conditionConfig: conditionConfigSchema,
        });
      } else if (nodeData.stepType === 'delay' || nodeData.stepType === 'wait') {
        extendedSchema = baseFormSchema.extend({
          delayConfig: delayConfigSchema,
        });
      }
      
      setFormSchema(extendedSchema);
      
      // Reset form with current node data
      form.reset({
        label: nodeData.label || '',
        description: nodeData.description || '',
        assignedTo: nodeData.assignedTo || '',
        estimatedHours: nodeData.estimatedHours || 0,
        emailConfig: nodeData.emailConfig || { to: '', subject: '', body: '' },
        webhookConfig: nodeData.webhookConfig || { url: '', method: 'POST' },
        conditionConfig: nodeData.conditionConfig || { field: '', operator: 'equals', value: '' },
        delayConfig: nodeData.delayConfig || { duration: 1, unit: 'hours' },
      });
    }
  }, [selectedNode, form]);

  const onSubmit = (data: any) => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, data);
    }
  };

  // Watch for form changes and update immediately
  const watchedValues = form.watch();
  
  useEffect(() => {
    if (selectedNode && Object.keys(watchedValues).length > 0) {
      const timeoutId = setTimeout(() => {
        onUpdateNode(selectedNode.id, watchedValues);
      }, 300); // Debounce updates
      
      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, selectedNode, onUpdateNode]);

  const getNodeIcon = (stepType: string) => {
    const iconMap: Record<string, any> = {
      'send-email': Mail,
      'webhook-call': Webhook,
      'update-record': Database,
      'if-condition': GitBranch,
      'filter': Filter,
      'delay': Clock,
      'wait': Clock,
      'approval': Users,
      'form-submitted': FileText,
      'schedule-trigger': Calendar,
    };
    
    return iconMap[stepType] || Settings;
  };

  if (!selectedNode) return null;

  const nodeData = selectedNode.data as WorkflowNodeData;
  const NodeIcon = getNodeIcon(nodeData.stepType);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <NodeIcon className="h-5 w-5 text-blue-600" />
            <SheetTitle>Configure Node</SheetTitle>
          </div>
          <SheetDescription>
            Configure the properties for this {nodeData.stepType} step.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Basic Settings</h3>
              
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter step label" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this step does" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter assignee name" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Configuration */}
            {nodeData.stepType === 'send-email' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Email Settings</h3>
                
                <FormField
                  control={form.control}
                  name="emailConfig.to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Email</FormLabel>
                      <FormControl>
                        <Input placeholder="recipient@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailConfig.subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Email subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailConfig.body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Email body content" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Webhook Configuration */}
            {nodeData.stepType === 'webhook-call' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Webhook Settings</h3>
                
                <FormField
                  control={form.control}
                  name="webhookConfig.url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com/webhook" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhookConfig.method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Condition Configuration */}
            {(nodeData.stepType.includes('condition') || nodeData.stepType === 'filter') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Condition Settings</h3>
                
                <FormField
                  control={form.control}
                  name="conditionConfig.field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableFields.map((fieldName) => (
                            <SelectItem key={fieldName} value={fieldName}>
                              {fieldName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conditionConfig.operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conditionConfig.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Delay Configuration */}
            {(nodeData.stepType === 'delay' || nodeData.stepType === 'wait') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Delay Settings</h3>
                
                <FormField
                  control={form.control}
                  name="delayConfig.duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delayConfig.unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Available Data Fields */}
            {availableFields.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Available Data Fields</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600 mb-2">You can reference these fields in your configuration:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableFields.map((field) => (
                      <span 
                        key={field}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded cursor-pointer hover:bg-blue-200"
                        onClick={() => navigator.clipboard.writeText(`{{${field}}}`)}
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
