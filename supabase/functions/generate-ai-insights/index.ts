
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

    // Get user profile and role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, department')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Fetch analytics data based on user role
    const insights = []

    // Personal insights for all users
    const { data: userAnalytics } = await supabaseClient
      .from('user_performance_analytics')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userAnalytics) {
      // Generate personal performance insights
      if (userAnalytics.completion_rate && userAnalytics.completion_rate > 90) {
        insights.push({
          insight_type: 'personal',
          title: 'Excellent Performance!',
          description: `You have an outstanding completion rate of ${userAnalytics.completion_rate}%. Keep up the great work!`,
          data: { completion_rate: userAnalytics.completion_rate },
          confidence_score: 0.95
        })
      }

      if (userAnalytics.avg_time_variance && userAnalytics.avg_time_variance < -2) {
        insights.push({
          insight_type: 'personal',
          title: 'Time Management Expert',
          description: `You consistently complete tasks faster than estimated. Consider sharing your efficiency techniques with the team.`,
          data: { time_variance: userAnalytics.avg_time_variance },
          confidence_score: 0.88
        })
      }
    }

    // Department insights for managers and above
    if (['manager', 'admin', 'root'].includes(profile.role)) {
      const { data: deptAnalytics } = await supabaseClient
        .from('department_analytics')
        .select('*')
        .eq('department', profile.department)
        .single()

      if (deptAnalytics) {
        if (deptAnalytics.department_completion_rate && deptAnalytics.department_completion_rate < 70) {
          insights.push({
            insight_type: 'department',
            title: 'Department Performance Alert',
            description: `${profile.department} department completion rate is ${deptAnalytics.department_completion_rate}%. Consider reviewing workload distribution.`,
            data: { department: profile.department, completion_rate: deptAnalytics.department_completion_rate },
            confidence_score: 0.82
          })
        }
      }
    }

    // Organization insights for admins and root
    if (['admin', 'root'].includes(profile.role)) {
      const { data: trends } = await supabaseClient
        .from('workflow_trends')
        .select('*')
        .order('date', { ascending: false })
        .limit(7)

      if (trends && trends.length > 0) {
        const avgCreated = trends.reduce((sum, day) => sum + (day.workflows_created || 0), 0) / trends.length
        const avgCompleted = trends.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) / trends.length

        if (avgCreated > avgCompleted * 1.5) {
          insights.push({
            insight_type: 'organization',
            title: 'Workflow Backlog Growing',
            description: `New workflows are being created faster than completed. Average ${avgCreated.toFixed(1)} created vs ${avgCompleted.toFixed(1)} completed daily.`,
            data: { avg_created: avgCreated, avg_completed: avgCompleted },
            confidence_score: 0.78
          })
        }
      }
    }

    // Store insights in database
    if (insights.length > 0) {
      const { error } = await supabaseClient
        .from('ai_insights')
        .insert(insights.map(insight => ({
          ...insight,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })))

      if (error) {
        console.error('Error storing insights:', error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights_generated: insights.length,
        insights: insights
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating insights:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
