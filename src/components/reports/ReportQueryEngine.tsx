
import { supabase } from '@/integrations/supabase/client';
import { ReportConfig } from './types';

export class ReportQueryEngine {
  static async generateReport(config: ReportConfig): Promise<any[]> {
    const { dataSource, selectedColumns, filters } = config;

    try {
      let query = supabase.from(dataSource).select(selectedColumns.join(', '));

      // Apply filters
      filters.forEach(filter => {
        switch (filter.operator) {
          case 'equals':
            query = query.eq(filter.column, filter.value);
            break;
          case 'not_equals':
            query = query.neq(filter.column, filter.value);
            break;
          case 'contains':
            query = query.ilike(filter.column, `%${filter.value}%`);
            break;
          case 'not_contains':
            query = query.not('like', `%${filter.value}%`);
            break;
          case 'starts_with':
            query = query.ilike(filter.column, `${filter.value}%`);
            break;
          case 'ends_with':
            query = query.ilike(filter.column, `%${filter.value}`);
            break;
          case 'greater_than':
            query = query.gt(filter.column, filter.value);
            break;
          case 'less_than':
            query = query.lt(filter.column, filter.value);
            break;
          case 'greater_equal':
            query = query.gte(filter.column, filter.value);
            break;
          case 'less_equal':
            query = query.lte(filter.column, filter.value);
            break;
          case 'is_null':
            query = query.is(filter.column, null);
            break;
          case 'is_not_null':
            query = query.not('is', null);
            break;
          case 'in':
            if (typeof filter.value === 'string') {
              const values = filter.value.split(',').map(v => v.trim());
              query = query.in(filter.column, values);
            }
            break;
          case 'not_in':
            if (typeof filter.value === 'string') {
              const values = filter.value.split(',').map(v => v.trim());
              query = query.not('in', filter.column, values);
            }
            break;
        }
      });

      // Limit to prevent too many results
      query = query.limit(1000);

      const { data, error } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  static getAvailableColumns(dataSource: string): string[] {
    const columnMappings: Record<string, string[]> = {
      'workflow_performance': [
        'id', 'name', 'status', 'priority', 'created_at', 'updated_at',
        'assigned_to_name', 'created_by_name', 'total_steps', 'completed_steps',
        'pending_steps', 'in_progress_steps', 'completion_percentage',
        'total_estimated_hours', 'total_actual_hours', 'total_duration_hours'
      ],
      'user_performance': [
        'id', 'full_name', 'role', 'department', 'workflows_created',
        'workflows_assigned', 'steps_assigned', 'steps_completed',
        'steps_in_progress', 'completion_rate', 'total_estimated_hours',
        'total_actual_hours', 'avg_time_variance'
      ],
      'workflow_steps': [
        'id', 'name', 'description', 'status', 'workflow_id',
        'step_order', 'assigned_to', 'estimated_hours', 'actual_hours',
        'created_at', 'updated_at'
      ],
      'workflow_step_assignments': [
        'id', 'workflow_step_id', 'assigned_to', 'assigned_by',
        'status', 'created_at', 'updated_at', 'completed_at',
        'due_date', 'notes'
      ],
      'department_analytics': [
        'department', 'total_users', 'workflows_created', 'total_steps',
        'completed_steps', 'department_completion_rate', 'total_estimated_hours',
        'total_actual_hours', 'avg_time_variance'
      ],
      'workflow_trends': [
        'date', 'workflows_created', 'workflows_completed', 'workflows_active',
        'workflows_paused', 'avg_completion_time_hours'
      ],
      'notifications': [
        'id', 'user_id', 'title', 'message', 'type', 'read',
        'created_at', 'updated_at', 'workflow_step_id'
      ],
      'workflows': [
        'id', 'name', 'description', 'status', 'priority', 'created_by',
        'assigned_to', 'created_at', 'updated_at', 'due_date',
        'is_reusable', 'tags'
      ],
      'profiles': [
        'id', 'email', 'first_name', 'last_name', 'role', 'department',
        'created_at', 'updated_at'
      ]
    };

    return columnMappings[dataSource] || [];
  }
}
