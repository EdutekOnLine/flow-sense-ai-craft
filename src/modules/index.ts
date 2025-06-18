
// Modules Registry
// Central entry point for all NeuraCore modules

export * as NeuraCore from './neura-core';
export * as NeuraFlow from './neura-flow';
export * as NeuraCRM from './neura-crm';
export * as NeuraForms from './neura-forms';
export * as NeuraEdu from './neura-edu';

// Module metadata for dynamic loading and configuration
export const MODULE_REGISTRY = {
  'neura-core': {
    name: 'NeuraCore',
    description: 'Core platform functionality',
    version: '1.0.0',
    isCore: true,
  },
  'neura-flow': {
    name: 'NeuraFlow',
    description: 'Workflow automation and process management',
    version: '1.0.0',
    isCore: false,
  },
  'neura-crm': {
    name: 'NeuraCRM',
    description: 'Customer relationship management',
    version: '1.0.0',
    isCore: false,
  },
  'neura-forms': {
    name: 'NeuraForms',
    description: 'Dynamic form builder and data collection',
    version: '1.0.0',
    isCore: false,
  },
  'neura-edu': {
    name: 'NeuraEdu',
    description: 'Educational content and learning management',
    version: '1.0.0',
    isCore: false,
  },
};
