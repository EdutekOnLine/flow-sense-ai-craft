import { supabase } from '@/integrations/supabase/client';
import { ReportConfig, DataSourceWithJoins, SelectedColumn } from './types';

export class ReportQueryEngine {
  static async generateReport(config: ReportConfig): Promise<any[]> {
    const { dataSources, selectedColumns, filters } = config;

    if (dataSources.length === 0) {
      throw new Error('No data sources specified');
    }

    try {
      // For multiple data sources, we need to build a complex query with joins
      if (dataSources.length === 1) {
        return await this.generateSingleSourceReport(dataSources[0], selectedColumns, filters);
      } else {
        return await this.generateMultiSourceReport(dataSources, selectedColumns, filters);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  private static async generateSingleSourceReport(
    dataSource: DataSourceWithJoins, 
    selectedColumns: SelectedColumn[], 
    filters: any[]
  ): Promise<any[]> {
    const sourceColumns = selectedColumns
      .filter(col => col.sourceId === dataSource.sourceId)
      .map(col => col.column);
    
    if (sourceColumns.length === 0) {
      return [];
    }

    let query: any;
    
    // Map data sources to actual Supabase tables/views
    switch (dataSource.sourceId) {
      case 'workflow_performance':
        query = supabase.from('workflow_performance_analytics').select(sourceColumns.join(', '));
        break;
      case 'user_performance':
        query = supabase.from('user_performance_analytics').select(sourceColumns.join(', '));
        break;
      case 'department_analytics':
        query = supabase.from('department_analytics').select(sourceColumns.join(', '));
        break;
      case 'workflow_trends':
        query = supabase.from('workflow_trends').select(sourceColumns.join(', '));
        break;
      case 'workflow_steps':
        query = supabase.from('workflow_steps').select(sourceColumns.join(', '));
        break;
      case 'workflow_step_assignments':
        query = supabase.from('workflow_step_assignments').select(sourceColumns.join(', '));
        break;
      case 'notifications':
        query = supabase.from('notifications').select(sourceColumns.join(', '));
        break;
      case 'workflows':
        query = supabase.from('workflows').select(sourceColumns.join(', '));
        break;
      case 'profiles':
        query = supabase.from('profiles').select(sourceColumns.join(', '));
        break;
      default:
        throw new Error(`Unsupported data source: ${dataSource.sourceId}`);
    }

    // Apply filters for single source
    const sourceFilters = filters.filter(f => f.sourceId === dataSource.sourceId);
    this.applyFilters(query, sourceFilters);

    // Limit to prevent too many results
    query = query.limit(1000);

    const { data, error } = await query;

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    return data || [];
  }

  private static async generateMultiSourceReport(
    dataSources: DataSourceWithJoins[], 
    selectedColumns: SelectedColumn[], 
    filters: any[]
  ): Promise<any[]> {
    // For multi-source reports, we'll use Supabase's select with joins
    const primarySource = dataSources[0];
    const primaryTable = this.getTableName(primarySource.sourceId);
    
    // Build the select statement with joins
    let selectClause = selectedColumns.map(col => {
      const table = this.getTableName(col.sourceId);
      const alias = col.alias || col.column;
      return `${table}.${col.column}:${alias}`;
    }).join(', ');

    // Build join clauses
    let joinedTables = new Set([primaryTable]);
    let query = supabase.from(primaryTable).select(selectClause);

    // For complex joins, we might need to use raw SQL or multiple queries
    // This is a simplified approach - in practice, you might need a more sophisticated query builder
    
    // Apply filters
    this.applyFilters(query, filters);

    // Limit results
    query = query.limit(1000);

    const { data, error } = await query;

    if (error) {
      console.error('Multi-source query error:', error);
      throw error;
    }

    return data || [];
  }

  private static applyFilters(query: any, filters: any[]) {
    filters.forEach(filter => {
      const column = filter.sourceId && filter.sourceId !== filters[0]?.sourceId 
        ? `${this.getTableName(filter.sourceId)}.${filter.column}`
        : filter.column;

      switch (filter.operator) {
        case 'equals':
          query = query.eq(column, filter.value);
          break;
        case 'not_equals':
          query = query.neq(column, filter.value);
          break;
        case 'contains':
          query = query.ilike(column, `%${filter.value}%`);
          break;
        case 'not_contains':
          query = query.not(column, 'ilike', `%${filter.value}%`);
          break;
        case 'starts_with':
          query = query.ilike(column, `${filter.value}%`);
          break;
        case 'ends_with':
          query = query.ilike(column, `%${filter.value}`);
          break;
        case 'greater_than':
          query = query.gt(column, filter.value);
          break;
        case 'less_than':
          query = query.lt(column, filter.value);
          break;
        case 'greater_equal':
          query = query.gte(column, filter.value);
          break;
        case 'less_equal':
          query = query.lte(column, filter.value);
          break;
        case 'is_null':
          query = query.is(column, null);
          break;
        case 'is_not_null':
          query = query.not(column, 'is', null);
          break;
        case 'in':
          if (typeof filter.value === 'string') {
            const values = filter.value.split(',').map(v => v.trim());
            query = query.in(column, values);
          }
          break;
        case 'not_in':
          if (typeof filter.value === 'string') {
            const values = filter.value.split(',').map(v => v.trim());
            query = query.not(column, 'in', values);
          }
          break;
      }
    });
  }

  private static getTableName(sourceId: string): string {
    const tableMap: Record<string, string> = {
      'workflow_performance': 'workflow_performance_analytics',
      'user_performance': 'user_performance_analytics',
      'department_analytics': 'department_analytics',
      'workflow_trends': 'workflow_trends',
      'workflow_steps': 'workflow_steps',
      'workflow_step_assignments': 'workflow_step_assignments',
      'notifications': 'notifications',
      'workflows': 'workflows',
      'profiles': 'profiles'
    };
    return tableMap[sourceId] || sourceId;
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
