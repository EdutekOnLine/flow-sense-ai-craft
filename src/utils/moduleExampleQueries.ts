
import { ModuleDataSourceMapper, DataSourceInfo } from './moduleDataSourceMapper';

export interface ExampleQuery {
  id: string;
  text: string;
  modules: string[];
  dataSources: string[];
  category: string;
}

// Module-specific example queries
const MODULE_EXAMPLE_QUERIES: Record<string, ExampleQuery[]> = {
  'neura-core': [
    {
      id: 'core-users-by-department',
      text: 'Show me all users grouped by department',
      modules: ['neura-core'],
      dataSources: ['profiles'],
      category: 'User Management'
    },
    {
      id: 'core-recent-notifications',
      text: 'Display unread notifications from the last 7 days',
      modules: ['neura-core'],
      dataSources: ['notifications'],
      category: 'System Activity'
    },
    {
      id: 'core-user-roles',
      text: 'List all users with their roles and creation dates',
      modules: ['neura-core'],
      dataSources: ['profiles'],
      category: 'User Management'
    }
  ],
  'neura-flow': [
    {
      id: 'flow-completed-workflows',
      text: 'Show me all completed workflows by department this month',
      modules: ['neura-flow'],
      dataSources: ['workflow_performance'],
      category: 'Workflow Analytics'
    },
    {
      id: 'flow-overdue-tasks',
      text: 'Display overdue tasks grouped by assigned user',
      modules: ['neura-flow'],
      dataSources: ['workflow_step_assignments'],
      category: 'Task Management'
    },
    {
      id: 'flow-performance-trends',
      text: 'Create a report on workflow trends over the last 30 days',
      modules: ['neura-flow'],
      dataSources: ['workflow_trends'],
      category: 'Performance Analytics'
    },
    {
      id: 'flow-step-duration',
      text: 'Show workflow steps that took longer than estimated',
      modules: ['neura-flow'],
      dataSources: ['workflow_steps'],
      category: 'Performance Analytics'
    }
  ],
  'neura-crm': [
    {
      id: 'crm-leads-by-status',
      text: 'Show me all leads by status this month',
      modules: ['neura-crm'],
      dataSources: ['crm_contacts'],
      category: 'Lead Management'
    },
    {
      id: 'crm-deal-pipeline',
      text: 'Display deal pipeline with values by stage',
      modules: ['neura-crm'],
      dataSources: ['crm_deal_pipeline_analytics'],
      category: 'Sales Pipeline'
    },
    {
      id: 'crm-overdue-tasks',
      text: 'List overdue CRM tasks by assignee',
      modules: ['neura-crm'],
      dataSources: ['crm_tasks'],
      category: 'Task Management'
    },
    {
      id: 'crm-contact-conversion',
      text: 'Generate contact conversion funnel report',
      modules: ['neura-crm'],
      dataSources: ['crm_contact_performance_view'],
      category: 'Conversion Analytics'
    },
    {
      id: 'crm-company-performance',
      text: 'Show company engagement and deal metrics',
      modules: ['neura-crm'],
      dataSources: ['companies', 'crm_deals'],
      category: 'Account Management'
    },
    {
      id: 'crm-sales-performance',
      text: 'Display sales team performance metrics',
      modules: ['neura-crm'],
      dataSources: ['crm_sales_performance_analytics'],
      category: 'Sales Analytics'
    },
    {
      id: 'crm-lead-sources',
      text: 'Analyze lead sources and conversion rates',
      modules: ['neura-crm'],
      dataSources: ['crm_contacts', 'crm_deals'],
      category: 'Marketing Analytics'
    },
    {
      id: 'crm-deal-activities',
      text: 'Show recent deal activity and stage changes',
      modules: ['neura-crm'],
      dataSources: ['crm_deal_activities'],
      category: 'Deal Tracking'
    },
    {
      id: 'crm-department-performance',
      text: 'Compare CRM performance across departments',
      modules: ['neura-crm'],
      dataSources: ['department_analytics'],
      category: 'Department Analytics'
    }
  ],
  'neura-forms': [
    {
      id: 'forms-pending-notifications',
      text: 'Display all pending notifications for managers',
      modules: ['neura-forms'],
      dataSources: ['notifications'],
      category: 'Form Management'
    },
    {
      id: 'forms-step-completion',
      text: 'Show form step completion rates by user',
      modules: ['neura-forms'],
      dataSources: ['workflow_steps'],
      category: 'Form Analytics'
    },
    {
      id: 'forms-recent-submissions',
      text: 'List recent form submissions with their status',
      modules: ['neura-forms'],
      dataSources: ['workflow_steps', 'notifications'],
      category: 'Form Management'
    }
  ],
  'neura-edu': [
    {
      id: 'edu-student-performance',
      text: 'Display student performance analytics for current semester',
      modules: ['neura-edu'],
      dataSources: ['user_performance_analytics'],
      category: 'Student Analytics'
    },
    {
      id: 'edu-completion-rates',
      text: 'Show students with completion rates above 80%',
      modules: ['neura-edu'],
      dataSources: ['user_performance_analytics'],
      category: 'Academic Performance'
    },
    {
      id: 'edu-workflow-performance',
      text: 'Display learning workflow performance by student',
      modules: ['neura-edu'],
      dataSources: ['workflow_performance', 'user_performance_analytics'],
      category: 'Learning Analytics'
    }
  ]
};

export class ModuleExampleQueryGenerator {
  /**
   * Get example queries based on active modules and available data sources
   */
  static getExampleQueries(
    activeModules: string[], 
    isRootUser: boolean = false,
    maxQueries: number = 8
  ): ExampleQuery[] {
    const availableDataSources = ModuleDataSourceMapper.getAvailableDataSources(activeModules, isRootUser);
    const availableDataSourceIds = availableDataSources.map(ds => ds.id);
    
    // If root user, show examples from all modules
    if (isRootUser) {
      const allQueries = Object.values(MODULE_EXAMPLE_QUERIES).flat();
      return this.selectDiverseQueries(allQueries, maxQueries);
    }
    
    // If no modules active, return empty array
    if (activeModules.length === 0) {
      return [];
    }
    
    // Get queries for active modules
    const relevantQueries: ExampleQuery[] = [];
    
    activeModules.forEach(moduleId => {
      const moduleQueries = MODULE_EXAMPLE_QUERIES[moduleId] || [];
      moduleQueries.forEach(query => {
        // Check if all required data sources are available
        const hasAllDataSources = query.dataSources.every(dsId => 
          availableDataSourceIds.includes(dsId)
        );
        
        if (hasAllDataSources) {
          relevantQueries.push(query);
        }
      });
    });
    
    return this.selectDiverseQueries(relevantQueries, maxQueries);
  }
  
  /**
   * Select diverse queries ensuring good category coverage
   */
  private static selectDiverseQueries(queries: ExampleQuery[], maxQueries: number): ExampleQuery[] {
    if (queries.length <= maxQueries) {
      return queries;
    }
    
    // Group by category for diversity
    const categorized = queries.reduce((acc, query) => {
      if (!acc[query.category]) {
        acc[query.category] = [];
      }
      acc[query.category].push(query);
      return acc;
    }, {} as Record<string, ExampleQuery[]>);
    
    const selected: ExampleQuery[] = [];
    const categories = Object.keys(categorized);
    let categoryIndex = 0;
    
    // Round-robin selection from categories
    while (selected.length < maxQueries && selected.length < queries.length) {
      const category = categories[categoryIndex % categories.length];
      const categoryQueries = categorized[category];
      
      // Find unselected query in this category
      const unselected = categoryQueries.find(q => !selected.includes(q));
      if (unselected) {
        selected.push(unselected);
      }
      
      categoryIndex++;
      
      // If we've gone through all categories, break to avoid infinite loop
      if (categoryIndex > categories.length * maxQueries) {
        break;
      }
    }
    
    return selected;
  }
  
  /**
   * Get module display name for badges
   */
  static getModuleDisplayName(moduleId: string): string {
    const displayNames: Record<string, string> = {
      'neura-core': 'NeuraCore',
      'neura-flow': 'NeuraFlow',
      'neura-crm': 'NeuraCRM',
      'neura-forms': 'NeuraForms',
      'neura-edu': 'NeuraEdu'
    };
    return displayNames[moduleId] || moduleId;
  }
  
  /**
   * Get fallback queries when no modules are active
   */
  static getFallbackQueries(): ExampleQuery[] {
    return [
      {
        id: 'fallback-activate-modules',
        text: 'Activate modules to see relevant example queries',
        modules: [],
        dataSources: [],
        category: 'Getting Started'
      }
    ];
  }
}
