
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useCrmTasks } from '@/hooks/useCrmTasks';
import { useCrmData } from '@/hooks/useCrmData';
import { useAuth } from '@/hooks/useAuth';
import { TaskFormFields } from './TaskFormFields';
import { createTaskSchema, defaultTaskValues, type CreateTaskForm } from './taskFormSchema';

interface CreateTaskFormProps {
  onSuccess: () => void;
}

export function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const { profile } = useAuth();
  const { createTask, isCreating } = useCrmTasks();
  const { contacts, companies } = useCrmData();

  const form = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: defaultTaskValues,
  });

  const onSubmit = async (data: CreateTaskForm) => {
    if (!profile?.workspace_id) return;

    await createTask({
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: data.status,
      due_date: data.due_date?.toISOString() || null,
      contact_id: data.contact_id === 'none' ? null : data.contact_id || null,
      company_id: data.company_id === 'none' ? null : data.company_id || null,
      assigned_to: data.assigned_to || null,
      workspace_id: profile.workspace_id,
      created_by: profile.id,
    });

    form.reset(defaultTaskValues);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TaskFormFields form={form} contacts={contacts} companies={companies} />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
