
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCrmCommunications } from '@/hooks/useCrmCommunications';
import { useAuth } from '@/hooks/useAuth';
import type { CrmCommunication } from '@/modules/neura-crm';

const communicationSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']),
  summary: z.string().min(1, 'Summary is required'),
  outcome: z.string().optional(),
  communication_date: z.date(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface CommunicationLogDialogProps {
  contactId: string;
  companyId?: string;
  dealId?: string;
  trigger?: React.ReactNode;
}

export function CommunicationLogDialog({ 
  contactId, 
  companyId, 
  dealId, 
  trigger 
}: CommunicationLogDialogProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const { createCommunication, isCreating } = useCrmCommunications();

  const form = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: 'note',
      summary: '',
      outcome: '',
      communication_date: new Date(),
    },
  });

  const onSubmit = (data: CommunicationFormData) => {
    if (!profile?.workspace_id || !profile.id) return;

    const communicationData: Omit<CrmCommunication, 'id' | 'created_at' | 'updated_at'> = {
      workspace_id: profile.workspace_id,
      contact_id: contactId,
      company_id: companyId || null,
      deal_id: dealId || null,
      type: data.type,
      summary: data.summary,
      outcome: data.outcome || null,
      communication_date: data.communication_date.toISOString(),
      created_by: profile.id,
    };

    createCommunication(communicationData);
    setOpen(false);
    form.reset();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'email': return '📧';
      case 'meeting': return '🤝';
      case 'note': return '📝';
      default: return '💬';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Log Communication
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Communication</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select communication type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">{getTypeIcon('call')} Call</SelectItem>
                      <SelectItem value="email">{getTypeIcon('email')} Email</SelectItem>
                      <SelectItem value="meeting">{getTypeIcon('meeting')} Meeting</SelectItem>
                      <SelectItem value="note">{getTypeIcon('note')} Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="communication_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief summary of the communication..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was the result or next steps..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Logging...' : 'Log Communication'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
