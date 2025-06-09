
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

    const insights = []

    // Get comprehensive analytics data
    const { data: trends } = await supabaseClient
      .from('workflow_trends')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    const { data: userAnalytics } = await supabaseClient
      .from('user_performance_analytics')
      .select('*')

    const { data: deptAnalytics } = await supabaseClient
      .from('department_analytics')
      .select('*')

    // Advanced Analytics: Predictive Insights
    if (trends && trends.length >= 7) {
      const recentTrends = trends.slice(0, 7)
      const olderTrends = trends.slice(7, 14)
      
      const recentAvg = recentTrends.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) / recentTrends.length
      const olderAvg = olderTrends.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) / (olderTrends.length || 1)
      
      const trendDirection = recentAvg > olderAvg ? 'increasing' : 'decreasing'
      const changePercent = Math.abs(((recentAvg - olderAvg) / olderAvg) * 100)

      if (changePercent > 10) {
        insights.push({
          insight_type: 'predictive',
          title: `Workflow Completion Trend ${trendDirection === 'increasing' ? 'Rising' : 'Declining'}`,
          description: `Based on the last 14 days of data, workflow completions are ${trendDirection} by ${changePercent.toFixed(1)}%. If this trend continues, expect ${trendDirection === 'increasing' ? 'improved' : 'reduced'} productivity in the coming week.`,
          data: { 
            trend: trendDirection, 
            change_percent: changePercent,
            recent_avg: recentAvg,
            prediction: recentAvg * (trendDirection === 'increasing' ? 1.1 : 0.9)
          },
          confidence_score: changePercent > 20 ? 0.85 : 0.72
        })
      }

      // Anomaly Detection
      const completionRates = recentTrends.map(day => day.workflows_completed || 0)
      const avgCompletion = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
      const stdDev = Math.sqrt(completionRates.reduce((sum, rate) => sum + Math.pow(rate - avgCompletion, 2), 0) / completionRates.length)
      
      const anomalies = completionRates.filter(rate => Math.abs(rate - avgCompletion) > 2 * stdDev)
      
      if (anomalies.length > 0) {
        insights.push({
          insight_type: 'anomaly',
          title: 'Workflow Completion Anomaly Detected',
          description: `Detected ${anomalies.length} day(s) with unusual workflow completion patterns. These anomalies suggest external factors may be affecting productivity. Consider investigating potential causes like system issues, team availability, or process changes.`,
          data: { 
            anomalies: anomalies.length,
            avg_completion: avgCompletion,
            anomalous_values: anomalies
          },
          confidence_score: 0.78
        })
      }
    }

    // Department Performance Analysis with Recommendations
    if (deptAnalytics && deptAnalytics.length > 1) {
      const topPerformer = deptAnalytics.reduce((max, dept) => 
        (dept.department_completion_rate || 0) > (max.department_completion_rate || 0) ? dept : max
      )
      
      const underPerformers = deptAnalytics.filter(dept => 
        (dept.department_completion_rate || 0) < (topPerformer.department_completion_rate || 0) * 0.8
      )

      if (underPerformers.length > 0) {
        insights.push({
          insight_type: 'recommendation',
          title: 'Cross-Department Learning Opportunity',
          description: `${topPerformer.department} department (${topPerformer.department_completion_rate?.toFixed(1)}% completion rate) significantly outperforms other departments. Consider implementing knowledge sharing sessions where ${topPerformer.department} team members can share best practices with ${underPerformers.map(d => d.department).join(', ')} departments.`,
          data: {
            top_performer: topPerformer.department,
            top_rate: topPerformer.department_completion_rate,
            underperformers: underPerformers.map(d => ({ dept: d.department, rate: d.department_completion_rate }))
          },
          confidence_score: 0.82
        })
      }
    }

    // Resource Utilization Insights
    if (userAnalytics && userAnalytics.length > 0) {
      const overutilizedUsers = userAnalytics.filter(user => 
        (user.steps_assigned || 0) > 10 && (user.completion_rate || 0) < 70
      )
      
      const underutilizedUsers = userAnalytics.filter(user => 
        (user.steps_assigned || 0) < 3 && (user.completion_rate || 0) > 90
      )

      if (overutilizedUsers.length > 0 && underutilizedUsers.length > 0) {
        insights.push({
          insight_type: 'resource_optimization',
          title: 'Workload Redistribution Opportunity',
          description: `Found ${overutilizedUsers.length} team member(s) with high workload but lower completion rates, and ${underutilizedUsers.length} member(s) with capacity for additional tasks. Consider redistributing workload to optimize team performance and prevent burnout.`,
          data: {
            overutilized: overutilizedUsers.map(u => ({ name: u.full_name, assigned: u.steps_assigned, rate: u.completion_rate })),
            underutilized: underutilizedUsers.map(u => ({ name: u.full_name, assigned: u.steps_assigned, rate: u.completion_rate }))
          },
          confidence_score: 0.75
        })
      }
    }

    // Time Efficiency Analysis
    if (userAnalytics) {
      const efficientUsers = userAnalytics.filter(user => 
        (user.avg_time_variance || 0) < -1 && (user.steps_completed || 0) > 5
      )

      if (efficientUsers.length > 0) {
        const topEfficient = efficientUsers.reduce((max, user) => 
          Math.abs(user.avg_time_variance || 0) > Math.abs(max.avg_time_variance || 0) ? user : max
        )

        insights.push({
          insight_type: 'efficiency',
          title: 'Time Management Best Practice Identified',
          description: `${topEfficient.full_name} consistently completes tasks ${Math.abs(topEfficient.avg_time_variance || 0).toFixed(1)} hours faster than estimated. This efficiency pattern could be studied and shared with the team to improve overall productivity. Consider conducting a brief interview to document their time management techniques.`,
          data: {
            efficient_user: topEfficient.full_name,
            time_saved: Math.abs(topEfficient.avg_time_variance || 0),
            completed_tasks: topEfficient.steps_completed
          },
          confidence_score: 0.87
        })
      }
    }

    // Seasonal Pattern Analysis (if enough historical data)
    if (trends && trends.length >= 21) {
      const weeklyPattern = []
      for (let i = 0; i < 3; i++) {
        const weekData = trends.slice(i * 7, (i + 1) * 7)
        const weekAvg = weekData.reduce((sum, day) => sum + (day.workflows_completed || 0), 0) / 7
        weeklyPattern.push(weekAvg)
      }

      const patternTrend = weeklyPattern[0] > weeklyPattern[2] ? 'declining' : 'improving'
      const weeklyVariance = Math.abs(weeklyPattern[0] - weeklyPattern[2]) / weeklyPattern[2] * 100

      if (weeklyVariance > 15) {
        insights.push({
          insight_type: 'pattern',
          title: 'Weekly Performance Pattern Detected',
          description: `Analysis of 3-week patterns shows productivity is ${patternTrend} with ${weeklyVariance.toFixed(1)}% variance between weeks. This suggests either cyclical business factors or team scheduling patterns. Consider analyzing external factors that might be influencing these weekly cycles.`,
          data: {
            pattern: patternTrend,
            variance: weeklyVariance,
            weekly_averages: weeklyPattern
          },
          confidence_score: 0.71
        })
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
