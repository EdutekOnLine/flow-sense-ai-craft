
import { ReportConfig } from '../types';
import { BarChart3, Users, TrendingUp, Calendar, Target, Building, Activity, User, Bell, PieChart, Clock, CheckCircle } from 'lucide-react';

export interface PredefinedReport {
  id: string;
  name: string;
  description: string;
  category: string;
  config: ReportConfig;
  requiredModules: string[];
  icon: any;
  isPopular?: boolean;
}

export const PREDEFINED_REPORTS: PredefinedReport[] = [
  // Workflow Reports
  {
    id: 'workflow-performance-summary',
    name: 'Workflow Performance Summary',
    description: 'Overview of workflow completion rates and performance metrics',
    category: 'Workflow Analytics',
    requiredModules: ['neura-flow'],
    icon: BarChart3,
    isPopular: true,
    config: {
      name: 'Workflow Performance Summary',
      dataSource: 'workflow_performance',
      selectedColumns: ['name', 'status', 'completion_percentage', 'total_steps', 'completed_steps', 'assigned_to_name', 'created_at'],
      filters: []
    }
  },
  {
    id: 'overdue-assignments',
    name: 'Overdue Task Assignments',
    description: 'List of overdue workflow step assignments',
    category: 'Task Management',
    requiredModules: ['neura-flow'],
    icon: Clock,
    config: {
      name: 'Overdue Task Assignments',
      dataSource: 'workflow_step_assignments',
      selectedColumns: ['workflow_step_id', 'assigned_to', 'status', 'due_date', 'created_at', 'notes'],
      filters: [
        {
          id: 'overdue-filter',
          column: 'due_date',
          operator: 'less_than',
          value: new Date().toISOString().split('T')[0],
          dataType: 'date'
        },
        {
          id: 'not-completed-filter',
          column: 'status',
          operator: 'not_equals',
          value: 'completed',
          dataType: 'text'
        }
      ]
    }
  },
  {
    id: 'user-performance-metrics',
    name: 'User Performance Metrics',
    description: 'Individual user productivity and completion statistics',
    category: 'Performance Analytics',
    requiredModules: ['neura-flow'],
    icon: Users,
    config: {
      name: 'User Performance Metrics',
      dataSource: 'user_performance',
      selectedColumns: ['full_name', 'department', 'completion_rate', 'workflows_created', 'steps_completed', 'total_estimated_hours', 'total_actual_hours'],
      filters: []
    }
  },
  // CRM Reports
  {
    id: 'crm-sales-pipeline-summary',
    name: 'Sales Pipeline Summary',
    description: 'Comprehensive overview of deals by stage with values and conversion metrics',
    category: 'Sales Pipeline',
    requiredModules: ['neura-crm'],
    icon: TrendingUp,
    isPopular: true,
    config: {
      name: 'Sales Pipeline Summary',
      dataSource: 'crm_deal_pipeline_analytics',
      selectedColumns: ['title', 'stage', 'value', 'currency', 'probability', 'weighted_value', 'assigned_to_name', 'contact_name', 'company_name', 'expected_close_date'],
      filters: []
    }
  },
  {
    id: 'crm-lead-conversion-report',
    name: 'Lead Conversion Report',
    description: 'Analysis of lead sources and conversion rates to customers',
    category: 'Conversion Analytics',
    requiredModules: ['neura-crm'],
    icon: Target,
    config: {
      name: 'Lead Conversion Report',
      dataSource: 'crm_contact_performance_view',
      selectedColumns: ['full_name', 'status', 'lead_source', 'lead_score', 'total_deals', 'won_deals', 'total_deal_value', 'won_deal_value', 'company_name', 'created_at'],
      filters: []
    }
  },
  {
    id: 'crm-task-completion-analytics',
    name: 'CRM Task Completion Analytics',
    description: 'Overview of CRM task management and completion rates',
    category: 'Task Management',
    requiredModules: ['neura-crm'],
    icon: CheckCircle,
    config: {
      name: 'CRM Task Completion Analytics',
      dataSource: 'crm_tasks',
      selectedColumns: ['title', 'status', 'priority', 'due_date', 'completed_at', 'assigned_to', 'created_by', 'contact_id', 'company_id'],
      filters: []
    }
  },
  {
    id: 'crm-sales-performance',
    name: 'Sales Team Performance',
    description: 'Individual and team sales performance metrics',
    category: 'Sales Analytics',
    requiredModules: ['neura-crm'],
    icon: Activity,
    isPopular: true,
    config: {
      name: 'Sales Team Performance',
      dataSource: 'crm_sales_performance_analytics',
      selectedColumns: ['full_name', 'department', 'total_deals', 'won_deals', 'deal_win_rate', 'total_deal_value', 'won_deal_value', 'pipeline_value', 'task_completion_rate'],
      filters: []
    }
  },
  {
    id: 'crm-company-engagement',
    name: 'Company Engagement Metrics',
    description: 'Analysis of company interactions and business development',
    category: 'Account Management',
    requiredModules: ['neura-crm'],
    icon: Building,
    config: {
      name: 'Company Engagement Metrics',
      dataSource: 'companies',
      selectedColumns: ['name', 'industry', 'annual_revenue', 'employee_count', 'city', 'state', 'created_at', 'updated_at'],
      filters: []
    }
  },
  {
    id: 'crm-deal-activity-timeline',
    name: 'Deal Activity Timeline',
    description: 'Historical view of deal changes and activities',
    category: 'Deal Tracking',
    requiredModules: ['neura-crm'],
    icon: Calendar,
    config: {
      name: 'Deal Activity Timeline',
      dataSource: 'crm_deal_activities',
      selectedColumns: ['deal_id', 'activity_type', 'old_value', 'new_value', 'description', 'created_by', 'created_at'],
      filters: []
    }
  },
  // Department Analytics
  {
    id: 'department-performance-comparison',
    name: 'Department Performance Comparison',
    description: 'Cross-department productivity comparison',
    category: 'Department Analytics',
    requiredModules: ['neura-crm'],
    icon: PieChart,
    config: {
      name: 'Department Performance Comparison',
      dataSource: 'department_analytics',
      selectedColumns: ['department', 'total_users', 'workflows_created', 'completed_steps', 'department_completion_rate', 'total_estimated_hours', 'total_actual_hours', 'avg_time_variance'],
      filters: []
    }
  },
  // User Management
  {
    id: 'user-directory',
    name: 'User Directory',
    description: 'Complete user listing with roles and departments',
    category: 'User Management',
    requiredModules: ['neura-core'],
    icon: User,
    config: {
      name: 'User Directory',
      dataSource: 'profiles',
      selectedColumns: ['first_name', 'last_name', 'email', 'role', 'department', 'created_at', 'updated_at'],
      filters: []
    }
  },
  // System Activity
  {
    id: 'recent-notifications',
    name: 'Recent System Notifications',
    description: 'Overview of recent system notifications and alerts',
    category: 'System Activity',
    requiredModules: ['neura-core'],
    icon: Bell,
    config: {
      name: 'Recent System Notifications',
      dataSource: 'notifications',
      selectedColumns: ['title', 'message', 'type', 'user_id', 'read', 'created_at', 'updated_at'],
      filters: [
        {
          id: 'recent-filter',
          column: 'created_at',
          operator: 'greater_than',
          value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dataType: 'date'
        }
      ]
    }
  }
];

export function getPredefinedReportsByModule(activeModules: string[]): PredefinedReport[] {
  return PREDEFINED_REPORTS.filter(report => 
    report.requiredModules.some(requiredModule => 
      activeModules.includes(requiredModule)
    )
  );
}

export function getPredefinedReportsByCategory(category: string): PredefinedReport[] {
  return PREDEFINED_REPORTS.filter(report => report.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set(PREDEFINED_REPORTS.map(report => report.category));
  return Array.from(categories).sort();
}
