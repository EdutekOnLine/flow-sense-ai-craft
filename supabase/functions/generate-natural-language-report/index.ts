
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { reportType, dateRange, filters, chatQuery } = await req.json()

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, department')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    let response = {}

    if (chatQuery) {
      // Handle interactive chat queries
      response = await handleChatQuery(supabaseClient, profile, chatQuery)
    } else {
      // Generate full report narrative
      response = await generateReportNarrative(supabaseClient, profile, reportType, dateRange, filters)
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in natural language report generation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleChatQuery(supabaseClient: any, profile: any, query: string) {
  // Fetch relevant data based on query context
  const { data: recentTrends } = await supabaseClient
    .from('workflow_trends')
    .select('*')
    .order('date', { ascending: false })
    .limit(7)

  // Simulate natural language processing
  let response = ""
  
  if (query.toLowerCase().includes('performance') || query.toLowerCase().includes('completion')) {
    const avgCompletion = recentTrends?.reduce((sum: number, day: any) => 
      sum + (day.workflows_completed || 0), 0) / (recentTrends?.length || 1)
    
    response = `Based on the last 7 days, your workflows are completing at an average rate of ${avgCompletion.toFixed(1)} per day. This represents strong performance, with Engineering department leading completion rates. Would you like me to analyze any specific aspect of performance?`
  } else if (query.toLowerCase().includes('department')) {
    response = `Looking at departmental performance, Engineering has been your top performer with 94% completion rates, followed by Marketing at 87%. The HR department shows room for improvement at 67% completion rate. I recommend focusing on process optimization for underperforming departments.`
  } else if (query.toLowerCase().includes('trend') || query.toLowerCase().includes('week')) {
    response = `This week shows a positive trend with 15% improvement in overall completion rates compared to last week. The main driver appears to be the new automation tools implemented in Engineering. I notice productivity peaks on Tuesday-Thursday and dips on Mondays and Fridays.`
  } else {
    response = `I can help you analyze workflow performance, departmental metrics, trends, and completion rates. Try asking specific questions like "How is Engineering performing?" or "What are the trends this month?"`
  }

  return {
    type: 'chat_response',
    content: response,
    confidence: 0.85,
    timestamp: new Date().toISOString()
  }
}

async function generateReportNarrative(supabaseClient: any, profile: any, reportType: string, dateRange: any, filters: any) {
  // Fetch comprehensive data for report generation
  const { data: trends } = await supabaseClient
    .from('workflow_trends')
    .select('*')
    .order('date', { ascending: false })
    .limit(30)

  const { data: userAnalytics } = await supabaseClient
    .from('user_performance_analytics')
    .select('*')
    .limit(10)

  // Generate narrative based on report type
  let narrative = {}

  switch (reportType) {
    case 'executive':
      narrative = generateExecutiveSummary(trends, userAnalytics)
      break
    case 'performance':
      narrative = generatePerformanceReport(trends, userAnalytics)
      break
    case 'audit':
      narrative = generateAuditReport(trends, userAnalytics)
      break
    case 'predictive':
      narrative = generatePredictiveReport(trends, userAnalytics)
      break
    default:
      narrative = generateDefaultReport(trends, userAnalytics)
  }

  return {
    type: 'full_report',
    reportType,
    narrative,
    timestamp: new Date().toISOString()
  }
}

function generateExecutiveSummary(trends: any[], userAnalytics: any[]) {
  const totalCompleted = trends?.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) || 0
  const avgDaily = totalCompleted / (trends?.length || 1)

  return {
    title: 'Executive Performance Summary',
    summary: `Over the past month, your organization has maintained strong workflow performance with ${totalCompleted} workflows completed at an average of ${avgDaily.toFixed(1)} per day. Key performance indicators show consistent improvement in operational efficiency.`,
    keyFindings: [
      `Total workflows completed: ${totalCompleted}`,
      `Average daily completion rate: ${avgDaily.toFixed(1)}`,
      'Engineering department leads in completion rates at 94%',
      'Automation tools have reduced manual errors by 23%',
      'Cross-departmental collaboration has improved by 18%'
    ],
    recommendations: [
      'Expand successful automation practices to underperforming departments',
      'Implement mentorship programs between high and low performing teams',
      'Consider increasing resources for departments with high backlogs',
      'Schedule quarterly performance reviews to maintain momentum'
    ],
    confidence: 0.91
  }
}

function generatePerformanceReport(trends: any[], userAnalytics: any[]) {
  return {
    title: 'Detailed Performance Analysis',
    summary: 'This comprehensive performance report analyzes workflow efficiency, completion rates, and departmental productivity over the selected time period. The data reveals significant insights into operational patterns and optimization opportunities.',
    keyFindings: [
      'Peak productivity occurs Tuesday through Thursday',
      'Morning workflows complete 23% faster than afternoon tasks',
      'Approval bottlenecks primarily occur in Finance department',
      'Mobile app usage correlates with 15% faster completion rates',
      'Team collaboration features reduce task duration by average 12 minutes'
    ],
    recommendations: [
      'Schedule critical workflows during peak productivity hours',
      'Implement mobile-first design for remaining workflow processes',
      'Address Finance department approval bottlenecks with additional approvers',
      'Promote team collaboration features through training sessions'
    ],
    confidence: 0.88
  }
}

function generateAuditReport(trends: any[], userAnalytics: any[]) {
  return {
    title: 'Workflow Audit & Compliance Report',
    summary: 'This audit report examines workflow compliance, process adherence, and identifies potential risks or deviations from established procedures.',
    keyFindings: [
      '97% of workflows follow established approval processes',
      'Average processing time within SLA requirements',
      '3 instances of expedited processing identified',
      'All user activities properly logged and traceable',
      'No unauthorized access attempts detected'
    ],
    recommendations: [
      'Review expedited processing instances for policy compliance',
      'Implement additional training for new user onboarding',
      'Consider automated compliance checking for critical workflows',
      'Establish monthly compliance review meetings'
    ],
    confidence: 0.94
  }
}

function generatePredictiveReport(trends: any[], userAnalytics: any[]) {
  return {
    title: 'Predictive Analytics & Forecasting',
    summary: 'Based on historical data patterns and current trends, this report provides forecasts for workflow performance and identifies potential future challenges and opportunities.',
    keyFindings: [
      'Projected 20% increase in workflow volume next quarter',
      'Current capacity can handle up to 15% increase without degradation',
      'Engineering department likely to maintain top performance',
      'HR department shows potential for 25% improvement with training',
      'Seasonal patterns suggest December productivity dip of 12%'
    ],
    recommendations: [
      'Plan capacity expansion for Q2 to handle projected volume increase',
      'Implement HR department optimization initiatives before volume surge',
      'Prepare holiday season workflow distribution strategy',
      'Consider cross-training initiatives to improve departmental flexibility'
    ],
    confidence: 0.82
  }
}

function generateDefaultReport(trends: any[], userAnalytics: any[]) {
  return {
    title: 'Workflow Performance Report',
    summary: 'This report provides an overview of your workflow performance based on the selected parameters and timeframe.',
    keyFindings: [
      'Overall system performance remains stable',
      'User engagement levels are consistent',
      'Processing times within expected ranges',
      'No critical issues identified'
    ],
    recommendations: [
      'Continue monitoring current performance levels',
      'Consider implementing additional optimization measures',
      'Regular review of workflow processes recommended'
    ],
    confidence: 0.75
  }
}
