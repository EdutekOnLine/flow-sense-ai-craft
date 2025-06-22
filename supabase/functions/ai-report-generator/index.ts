
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIReportRequest {
  query: string;
  activeModules?: string[];
  isRootUser?: boolean;
}

// Module-aware data sources mapping
const MODULE_DATA_SOURCES = {
  'neura-core': {
    name: 'NeuraCore',
    dataSources: ['profiles', 'notifications'],
    description: 'Core system data including users and notifications'
  },
  'neura-flow': {
    name: 'NeuraFlow', 
    dataSources: ['workflow_performance', 'workflow_steps', 'workflow_step_assignments', 'workflow_trends', 'workflows'],
    description: 'Workflow and process management data'
  },
  'neura-crm': {
    name: 'NeuraCRM',
    dataSources: ['profiles', 'department_analytics'], 
    description: 'Customer relationship and sales data'
  },
  'neura-forms': {
    name: 'NeuraForms',
    dataSources: ['workflow_steps', 'notifications'],
    description: 'Form submissions and response data'
  },
  'neura-edu': {
    name: 'NeuraEdu',
    dataSources: ['profiles', 'workflow_performance', 'user_performance_analytics'],
    description: 'Educational content and learning progress data'
  }
};

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
  ],
  'user_performance_analytics': [
    'id', 'full_name', 'role', 'department', 'completion_rate',
    'total_estimated_hours', 'total_actual_hours', 'avg_time_variance',
    'workflows_created', 'workflows_assigned', 'steps_assigned', 'steps_completed'
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, activeModules = [], isRootUser = false }: AIReportRequest = await req.json();

    console.log('Processing AI report query:', query);
    console.log('Active modules:', activeModules);
    console.log('Is root user:', isRootUser);

    // Get current date for context
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const firstDayOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const firstDayOfYear = `${currentYear}-01-01`;
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build available data sources based on active modules
    const availableDataSources: string[] = [];
    const moduleContext: string[] = [];
    
    if (isRootUser) {
      // Root users can access all data sources
      availableDataSources.push(...Object.keys(columnMappings));
      moduleContext.push('You have ROOT ACCESS - all data sources are available regardless of module activation.');
    } else {
      // Build available sources based on active modules
      activeModules.forEach(moduleId => {
        const moduleConfig = MODULE_DATA_SOURCES[moduleId as keyof typeof MODULE_DATA_SOURCES];
        if (moduleConfig) {
          availableDataSources.push(...moduleConfig.dataSources);
          moduleContext.push(`${moduleConfig.name}: ${moduleConfig.description} (Data sources: ${moduleConfig.dataSources.join(', ')})`);
        }
      });
    }

    // Remove duplicates
    const uniqueDataSources = [...new Set(availableDataSources)];

    // Build data sources info for prompt
    const dataSourcesInfo = uniqueDataSources.map(dsId => {
      const columns = columnMappings[dsId] || [];
      return `${dsId}: ${columns.join(', ')}`;
    }).join('\n');

    const systemPrompt = `You are an AI assistant that converts natural language queries into structured report configurations for a modular business platform.

CURRENT DATE CONTEXT:
- Today's date: ${currentDateString}
- Current month: ${currentMonth}/${currentYear}
- Current year: ${currentYear}

MODULE CONTEXT:
${moduleContext.join('\n')}

AVAILABLE DATA SOURCES AND COLUMNS:
${dataSourcesInfo}

${!isRootUser && uniqueDataSources.length === 0 ? 
  'WARNING: No data sources are available. The user needs to activate modules to access data.' : 
  ''}

Available filter operators:
- equals, not_equals
- contains, not_contains, starts_with, ends_with
- greater_than, less_than, greater_equal, less_equal
- between, in, not_in
- is_null, is_not_null

RELATIVE DATE HANDLING:
When users mention relative dates, use these calculations:
- "this month" = from ${firstDayOfMonth} to ${currentDateString}
- "this year" = from ${firstDayOfYear} to ${currentDateString}
- "last 30 days" = from ${thirtyDaysAgo} to ${currentDateString}
- "last 7 days" or "this week" = from ${sevenDaysAgo} to ${currentDateString}
- "today" = ${currentDateString}

DATE FORMAT: Always use YYYY-MM-DD format for date values in filters.

You must return a JSON object with this exact structure:
{
  "dataSource": "data_source_id",
  "selectedColumns": ["column1", "column2"],
  "filters": [
    {
      "id": "unique_id",
      "column": "column_name",
      "operator": "operator_name",
      "value": "filter_value",
      "dataType": "text|number|date|boolean"
    }
  ],
  "name": "Generated Report Name",
  "explanation": "Brief explanation of what this report shows and which modules provide the data"
}

Important rules:
1. ONLY use data sources and columns that exist in the available list above
2. If no data sources are available, return an error explaining that modules need to be activated
3. Select relevant columns that answer the user's question
4. Add appropriate filters based on the query
5. Use proper data types for filters
6. Generate a descriptive report name
7. For date-related queries, always use the current date context provided above
8. In the explanation, mention which modules provide access to the data
9. If the query is unclear, make reasonable assumptions but explain them

${!isRootUser && uniqueDataSources.length === 0 ? 
  'Since no data sources are available, return an error message explaining that the user needs to activate modules first.' : 
  ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    console.log('AI response:', aiResponse);

    // Validate the response structure and available data sources
    if (!aiResponse.dataSource || !aiResponse.selectedColumns || !Array.isArray(aiResponse.selectedColumns)) {
      throw new Error('Invalid AI response structure');
    }

    // Check if requested data source is available
    if (!isRootUser && !uniqueDataSources.includes(aiResponse.dataSource)) {
      throw new Error(`Data source "${aiResponse.dataSource}" is not available with your current module configuration. Please activate the required modules first.`);
    }

    // Ensure filters have proper IDs
    if (aiResponse.filters) {
      aiResponse.filters = aiResponse.filters.map((filter: any, index: number) => ({
        ...filter,
        id: filter.id || `filter_${index + 1}`
      }));
    }

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-report-generator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process AI report generation request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
