
export interface ModuleDataSourceConfig {
  moduleId: string;
  dataSources: string[];
  displayName: string;
  description: string;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  description: string;
  requiredModules: string[];
  icon?: string;
}

// Module to data source mapping
export const MODULE_DATA_SOURCES: ModuleDataSourceConfig[] = [
  {
    moduleId: 'neura-core',
    dataSources: ['profiles', 'notifications'],
    displayName: 'NeuraCore',
    description: 'Core system data including users and notifications'
  },
  {
    moduleId: 'neura-flow',
    dataSources: ['workflow_performance', 'workflow_steps', 'workflow_step_assignments', 'workflow_trends', 'workflows'],
    displayName: 'NeuraFlow',
    description: 'Workflow and process management data'
  },
  {
    moduleId: 'neura-crm',
    dataSources: ['profiles', 'department_analytics'],
    displayName: 'NeuraCRM',
    description: 'Customer relationship and sales data'
  },
  {
    moduleId: 'neura-forms',
    dataSources: ['workflow_steps', 'notifications'],
    displayName: 'NeuraForms',
    description: 'Form submissions and response data'
  },
  {
    moduleId: 'neura-edu',
    dataSources: ['profiles', 'workflow_performance', 'user_performance_analytics'],
    displayName: 'NeuraEdu',
    description: 'Educational content and learning progress data'
  }
];

// Enhanced data source information with module requirements
export const DATA_SOURCE_INFO: Record<string, DataSourceInfo> = {
  'workflow_performance': {
    id: 'workflow_performance',
    name: 'Workflow Performance',
    description: 'Data about workflow completion, progress, and timing',
    requiredModules: ['neura-flow']
  },
  'user_performance': {
    id: 'user_performance',
    name: 'User Performance',
    description: 'User productivity, completion rates, and task metrics',
    requiredModules: ['neura-flow']
  },
  'workflow_steps': {
    id: 'workflow_steps',
    name: 'Workflow Steps',
    description: 'Individual workflow steps and their details',
    requiredModules: ['neura-flow', 'neura-forms']
  },
  'workflow_step_assignments': {
    id: 'workflow_step_assignments',
    name: 'Task Assignments',
    description: 'Task assignments and completion status',
    requiredModules: ['neura-flow']
  },
  'department_analytics': {
    id: 'department_analytics',
    name: 'Department Analytics',
    description: 'Department-level performance and metrics',
    requiredModules: ['neura-crm']
  },
  'workflow_trends': {
    id: 'workflow_trends',
    name: 'Workflow Trends',
    description: 'Historical workflow trends and patterns',
    requiredModules: ['neura-flow']
  },
  'notifications': {
    id: 'notifications',
    name: 'Notifications',
    description: 'System notifications and alerts',
    requiredModules: ['neura-core', 'neura-forms']
  },
  'workflows': {
    id: 'workflows',
    name: 'Workflows',
    description: 'Workflow definitions and metadata',
    requiredModules: ['neura-flow']
  },
  'profiles': {
    id: 'profiles',
    name: 'Users',
    description: 'User profiles and information',
    requiredModules: ['neura-core', 'neura-crm', 'neura-edu']
  },
  'user_performance_analytics': {
    id: 'user_performance_analytics',
    name: 'User Analytics',
    description: 'Advanced user performance analytics',
    requiredModules: ['neura-edu']
  }
};

export class ModuleDataSourceMapper {
  static DATA_SOURCE_INFO = DATA_SOURCE_INFO;

  /**
   * Get available data sources based on active modules
   */
  static getAvailableDataSources(activeModules: string[], isRootUser: boolean = false): DataSourceInfo[] {
    // Root users can access all data sources
    if (isRootUser) {
      return Object.values(DATA_SOURCE_INFO);
    }

    const availableDataSources: DataSourceInfo[] = [];
    
    Object.values(DATA_SOURCE_INFO).forEach(dataSource => {
      // Check if any of the required modules are active
      const hasRequiredModule = dataSource.requiredModules.some(moduleId => 
        activeModules.includes(moduleId)
      );
      
      if (hasRequiredModule) {
        availableDataSources.push(dataSource);
      }
    });

    return availableDataSources;
  }

  /**
   * Get modules that provide access to a specific data source
   */
  static getModulesForDataSource(dataSourceId: string): string[] {
    const dataSource = DATA_SOURCE_INFO[dataSourceId];
    return dataSource ? dataSource.requiredModules : [];
  }

  /**
   * Check if a data source is available with current active modules
   */
  static isDataSourceAvailable(dataSourceId: string, activeModules: string[], isRootUser: boolean = false): boolean {
    if (isRootUser) return true;
    
    const dataSource = DATA_SOURCE_INFO[dataSourceId];
    if (!dataSource) return false;
    
    return dataSource.requiredModules.some(moduleId => activeModules.includes(moduleId));
  }

  /**
   * Get suggested modules to activate for accessing unavailable data sources
   */
  static getSuggestedModules(unavailableDataSources: string[], activeModules: string[]): string[] {
    const suggestedModules = new Set<string>();
    
    unavailableDataSources.forEach(dataSourceId => {
      const dataSource = DATA_SOURCE_INFO[dataSourceId];
      if (dataSource) {
        dataSource.requiredModules.forEach(moduleId => {
          if (!activeModules.includes(moduleId)) {
            suggestedModules.add(moduleId);
          }
        });
      }
    });
    
    return Array.from(suggestedModules);
  }

  /**
   * Get data sources grouped by module
   */
  static getDataSourcesByModule(activeModules: string[]): Record<string, DataSourceInfo[]> {
    const groupedDataSources: Record<string, DataSourceInfo[]> = {};
    
    MODULE_DATA_SOURCES.forEach(moduleConfig => {
      if (activeModules.includes(moduleConfig.moduleId)) {
        groupedDataSources[moduleConfig.moduleId] = moduleConfig.dataSources
          .map(dsId => DATA_SOURCE_INFO[dsId])
          .filter((ds): ds is DataSourceInfo => Boolean(ds));
      }
    });
    
    return groupedDataSources;
  }
}
