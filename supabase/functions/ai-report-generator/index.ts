
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIReportRequest {
  query: string;
}

const dataSources = [
  { id: 'workflow_performance', name: 'Workflow Performance', description: 'Data about workflow completion, progress, and timing' },
  { id: 'user_performance', name: 'User Performance', description: 'User productivity, completion rates, and task metrics' },
  { id: 'workflow_steps', name: 'Workflow Steps', description: 'Individual workflow steps and their details' },
  { id: 'workflow_step_assignments', name: 'Task Assignments', description: 'Task assignments and completion status' },
  { id: 'department_analytics', name: 'Department Analytics', description: 'Department-level performance and metrics' },
  { id: 'workflow_trends', name: 'Workflow Trends', description: 'Historical workflow trends and patterns' },
  { id: 'notifications', name: 'Notifications', description: 'System notifications and alerts' },
  { id: 'workflows', name: 'Workflows', description: 'Workflow definitions and metadata' },
  { id: 'profiles', name: 'Users', description: 'User profiles and information' }
];

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query }: AIReportRequest = await req.json();

    console.log('Processing AI report query:', query);

    // Get current date for context
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    // Calculate common date ranges
    const firstDayOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const firstDayOfYear = `${currentYear}-01-01`;
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const systemPrompt = `You are an AI assistant that converts natural language queries into structured report configurations.

CURRENT DATE CONTEXT:
- Today's date: ${currentDateString}
- Current month: ${currentMonth}/${currentYear}
- Current year: ${currentYear}

Available data sources and their columns:
${dataSources.map(ds => `${ds.name} (${ds.id}): ${ds.description}\nColumns: ${columnMappings[ds.id]?.join(', ')}`).join('\n\n')}

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
  "explanation": "Brief explanation of what this report shows"
}

Important rules:
1. Only use data sources and columns that exist in the provided lists
2. Select relevant columns that answer the user's question
3. Add appropriate filters based on the query
4. Use proper data types for filters
5. Generate a descriptive report name
6. For date-related queries, always use the current date context provided above
7. If the query is unclear, make reasonable assumptions but explain them

Example queries and responses:
- "Show me completed workflows this month" → Use workflow_performance, filter created_at >= ${firstDayOfMonth} AND status = completed
- "List users with high completion rates" → Use user_performance, filter completion_rate > 80
- "Workflows created in the last 30 days" → Use workflows, filter created_at >= ${thirtyDaysAgo}`;

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

    // Validate the response structure
    if (!aiResponse.dataSource || !aiResponse.selectedColumns || !Array.isArray(aiResponse.selectedColumns)) {
      throw new Error('Invalid AI response structure');
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
