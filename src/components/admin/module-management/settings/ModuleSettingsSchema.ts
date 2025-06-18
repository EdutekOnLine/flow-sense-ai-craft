
interface SettingDefinition {
  type: 'number' | 'boolean' | 'text' | 'textarea';
  default: any;
  label: string;
}

export const getModuleSettingsSchema = (moduleName: string): Record<string, Record<string, SettingDefinition>> => {
  const schemas: Record<string, Record<string, Record<string, SettingDefinition>>> = {
    'neura-core': {
      general: {
        maxUsers: { type: 'number', default: 100, label: 'Maximum Users' },
        sessionTimeout: { type: 'number', default: 30, label: 'Session Timeout (minutes)' },
        enableAuditLog: { type: 'boolean', default: true, label: 'Enable Audit Logging' },
      },
      security: {
        passwordMinLength: { type: 'number', default: 8, label: 'Minimum Password Length' },
        requireMFA: { type: 'boolean', default: false, label: 'Require Multi-Factor Authentication' },
        allowGuestAccess: { type: 'boolean', default: false, label: 'Allow Guest Access' },
      }
    },
    'neura-flow': {
      workflow: {
        maxStepsPerWorkflow: { type: 'number', default: 50, label: 'Max Steps per Workflow' },
        autoSaveInterval: { type: 'number', default: 5, label: 'Auto-save Interval (minutes)' },
        enableVersioning: { type: 'boolean', default: true, label: 'Enable Workflow Versioning' },
      },
      execution: {
        maxConcurrentExecutions: { type: 'number', default: 10, label: 'Max Concurrent Executions' },
        executionTimeout: { type: 'number', default: 60, label: 'Execution Timeout (minutes)' },
        retryAttempts: { type: 'number', default: 3, label: 'Retry Attempts on Failure' },
      }
    },
    'neura-crm': {
      contacts: {
        maxContactsPerUser: { type: 'number', default: 1000, label: 'Max Contacts per User' },
        enableDuplicateDetection: { type: 'boolean', default: true, label: 'Enable Duplicate Detection' },
        autoEnrichment: { type: 'boolean', default: false, label: 'Auto Contact Enrichment' },
      },
      pipeline: {
        maxPipelineStages: { type: 'number', default: 10, label: 'Max Pipeline Stages' },
        enableActivityTracking: { type: 'boolean', default: true, label: 'Enable Activity Tracking' },
        autoMoveDeals: { type: 'boolean', default: false, label: 'Auto-move Stale Deals' },
      }
    }
  };
  return schemas[moduleName] || {};
};

export type { SettingDefinition };
