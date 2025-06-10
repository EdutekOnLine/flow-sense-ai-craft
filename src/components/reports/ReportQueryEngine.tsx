
import { supabase } from '@/integrations/supabase/client';
import { ReportConfig, DataSourceWithJoins, SelectedColumn } from './types';

export class ReportQueryEngine {
  static async generateReport(config: ReportConfig): Promise<any[]> {
    const { dataSources, selectedColumns, filters } = config;

    if (dataSources.length === 0) {
      throw new Error('No data sources specified');
    }

    try {
      console.log('Starting report generation with config:', config);
      
      if (dataSources.length === 1) {
        return await this.generateSingleSourceReport(dataSources[0], selectedColumns, filters);
      } else {
        // For multiple sources, generate multi-section report
        return await this.generateMultiSectionReport(dataSources, selectedColumns, filters);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  private static async generateMultiSectionReport(
    dataSources: DataSourceWithJoins[], 
    selectedColumns: SelectedColumn[], 
    filters: any[]
  ): Promise<any[]> {
    console.log('Generating multi-section report');
    
    const results: any[] = [];
    
    for (const dataSource of dataSources) {
      const sourceColumns = selectedColumns.filter(col => col.sourceId === dataSource.sourceId);
      const sourceFilters = filters.filter(f => f.sourceId === dataSource.sourceId);
      
      if (sourceColumns.length > 0) {
        try {
          const sourceData = await this.generateSingleSourceReport(dataSource, sourceColumns, sourceFilters);
          
          // Add prefixed columns and source identification
          const enrichedData = sourceData.map(row => {
            const newRow: any = {
              _source: dataSource.sourceId,
              _sourceLabel: this.getSourceLabel(dataSource.sourceId)
            };
            
            // Prefix column names with source to avoid conflicts
            sourceColumns.forEach(col => {
              const originalKey = col.column;
              const prefixedKey = `${dataSource.sourceId}_${originalKey}`;
              newRow[prefixedKey] = row[originalKey];
            });
            
            return newRow;
          });
          
          results.push(...enrichedData);
        } catch (error) {
          console.error(`Error querying source ${dataSource.sourceId}:`, error);
        }
      }
    }
    
    console.log('Multi-section report result:', { rowCount: results.length, sampleRow: results[0] });
    return results;
  }

  private static getSourceLabel(sourceId: string): string {
    const labelMap: Record<string, string> = {
      'workflow_performance': 'Workflow Performance',
      'user_performance': 'User Performance',
      'workflows': 'Workflows',
      'profiles': 'Users',
      'workflow_steps': 'Workflow Steps',
      'workflow_step_assignments': 'Task Assignments',
      'department_analytics': 'Department Analytics',
      'workflow_trends': 'Workflow Trends',
      'notifications': 'Notifications'
    };
    return labelMap[sourceId] || sourceId;
  }

  private static async generateSingleSourceReport(
    dataSource: DataSourceWithJoins, 
    selectedColumns: SelectedColumn[], 
    filters: any[]
  ): Promise<any[]> {
    console.log('Generating single source report for:', dataSource.sourceId);
    
    const sourceColumns = selectedColumns
      .filter(col => col.sourceId === dataSource.sourceId)
      .map(col => col.column);
    
    console.log('Selected columns for source:', sourceColumns);
    
    if (sourceColumns.length === 0) {
      return [];
    }

    let query: any;
    
    // Map data sources to actual Supabase tables/views using type assertions
    const tableName = this.getTableName(dataSource.sourceId);
    console.log('Querying table:', tableName);
    
    switch (dataSource.sourceId) {
      case 'workflow_performance':
        query = supabase.from('workflow_performance_analytics' as any).select(sourceColumns.join(', '));
        break;
      case 'user_performance':
        query = supabase.from('user_performance_analytics' as any).select(sourceColumns.join(', '));
        break;
      case 'department_analytics':
        query = supabase.from('department_analytics' as any).select(sourceColumns.join(', '));
        break;
      case 'workflow_trends':
        query = supabase.from('workflow_trends' as any).select(sourceColumns.join(', '));
        break;
      case 'workflow_steps':
        query = supabase.from('workflow_steps' as any).select(sourceColumns.join(', '));
        break;
      case 'workflow_step_assignments':
        query = supabase.from('workflow_step_assignments' as any).select(sourceColumns.join(', '));
        break;
      case 'notifications':
        query = supabase.from('notifications' as any).select(sourceColumns.join(', '));
        break;
      case 'workflows':
        query = supabase.from('workflows' as any).select(sourceColumns.join(', '));
        break;
      case 'profiles':
        query = supabase.from('profiles' as any).select(sourceColumns.join(', '));
        break;
      default:
        throw new Error(`Unsupported data source: ${dataSource.sourceId}`);
    }

    // Apply filters for single source
    const sourceFilters = filters.filter(f => f.sourceId === dataSource.sourceId);
    console.log('Applying filters:', sourceFilters);
    this.applyFilters(query, sourceFilters);

    // Limit to prevent too many results
    query = query.limit(1000);

    const { data, error } = await query;

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    console.log('Query result:', { rowCount: data?.length, sampleRow: data?.[0] });
    return data || [];
  }

  private static applyFilters(query: any, filters: any[]) {
    filters.forEach(filter => {
      this.applySingleFilter(query, filter.column, filter);
    });
  }

  private static applySingleFilter(query: any, column: string, filter: any) {
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
