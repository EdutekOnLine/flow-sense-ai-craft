
-- Create analytics views for better performance (corrected)
CREATE OR REPLACE VIEW workflow_performance_analytics AS
SELECT 
  w.id,
  w.name,
  w.status,
  w.priority,
  w.created_at,
  w.updated_at,
  w.created_by,
  w.assigned_to,
  p_creator.first_name || ' ' || p_creator.last_name AS created_by_name,
  p_assigned.first_name || ' ' || p_assigned.last_name AS assigned_to_name,
  COUNT(ws.id) AS total_steps,
  COUNT(CASE WHEN ws.status = 'completed' THEN 1 END) AS completed_steps,
  COUNT(CASE WHEN ws.status = 'in_progress' THEN 1 END) AS in_progress_steps,
  COUNT(CASE WHEN ws.status = 'pending' THEN 1 END) AS pending_steps,
  ROUND(
    (COUNT(CASE WHEN ws.status = 'completed' THEN 1 END)::numeric / NULLIF(COUNT(ws.id), 0)) * 100, 
    2
  ) AS completion_percentage,
  SUM(ws.estimated_hours) AS total_estimated_hours,
  SUM(ws.actual_hours) AS total_actual_hours,
  EXTRACT(EPOCH FROM (w.updated_at - w.created_at)) / 3600 AS total_duration_hours
FROM workflows w
LEFT JOIN workflow_steps ws ON w.id = ws.workflow_id
LEFT JOIN profiles p_creator ON w.created_by = p_creator.id
LEFT JOIN profiles p_assigned ON w.assigned_to = p_assigned.id
GROUP BY w.id, w.name, w.status, w.priority, w.created_at, w.updated_at, w.created_by, w.assigned_to, p_creator.first_name, p_creator.last_name, p_assigned.first_name, p_assigned.last_name;

-- Create user performance analytics view
CREATE OR REPLACE VIEW user_performance_analytics AS
SELECT 
  p.id,
  p.first_name || ' ' || p.last_name AS full_name,
  p.role,
  p.department,
  COUNT(DISTINCT w.id) AS workflows_created,
  COUNT(DISTINCT wa.id) AS workflows_assigned,
  COUNT(DISTINCT ws.id) AS steps_assigned,
  COUNT(CASE WHEN ws.status = 'completed' THEN 1 END) AS steps_completed,
  COUNT(CASE WHEN ws.status = 'in_progress' THEN 1 END) AS steps_in_progress,
  ROUND(
    (COUNT(CASE WHEN ws.status = 'completed' THEN 1 END)::numeric / NULLIF(COUNT(ws.id), 0)) * 100, 
    2
  ) AS completion_rate,
  SUM(ws.estimated_hours) AS total_estimated_hours,
  SUM(ws.actual_hours) AS total_actual_hours,
  AVG(ws.actual_hours - ws.estimated_hours) AS avg_time_variance
FROM profiles p
LEFT JOIN workflows w ON p.id = w.created_by
LEFT JOIN workflows wa ON p.id = wa.assigned_to
LEFT JOIN workflow_steps ws ON p.id = ws.assigned_to
GROUP BY p.id, p.first_name, p.last_name, p.role, p.department;

-- Create department analytics view
CREATE OR REPLACE VIEW department_analytics AS
SELECT 
  p.department,
  COUNT(DISTINCT p.id) AS total_users,
  COUNT(DISTINCT w.id) AS workflows_created,
  COUNT(DISTINCT ws.id) AS total_steps,
  COUNT(CASE WHEN ws.status = 'completed' THEN 1 END) AS completed_steps,
  ROUND(
    (COUNT(CASE WHEN ws.status = 'completed' THEN 1 END)::numeric / NULLIF(COUNT(ws.id), 0)) * 100, 
    2
  ) AS department_completion_rate,
  SUM(ws.estimated_hours) AS total_estimated_hours,
  SUM(ws.actual_hours) AS total_actual_hours,
  AVG(ws.actual_hours - ws.estimated_hours) AS avg_time_variance
FROM profiles p
LEFT JOIN workflows w ON p.id = w.created_by
LEFT JOIN workflow_steps ws ON p.id = ws.assigned_to
WHERE p.department IS NOT NULL
GROUP BY p.department;

-- Create time-based analytics view
CREATE OR REPLACE VIEW workflow_trends AS
SELECT 
  DATE_TRUNC('day', w.created_at) AS date,
  COUNT(*) AS workflows_created,
  COUNT(CASE WHEN w.status = 'completed' THEN 1 END) AS workflows_completed,
  COUNT(CASE WHEN w.status = 'active' THEN 1 END) AS workflows_active,
  COUNT(CASE WHEN w.status = 'paused' THEN 1 END) AS workflows_paused,
  AVG(EXTRACT(EPOCH FROM (w.updated_at - w.created_at)) / 3600) AS avg_completion_time_hours
FROM workflows w
GROUP BY DATE_TRUNC('day', w.created_at)
ORDER BY date DESC;

-- Create table for storing AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policy for ai_insights - users can view insights based on their role (fixed function call)
CREATE POLICY "Users can view AI insights based on role" 
  ON ai_insights 
  FOR SELECT 
  USING (
    CASE 
      WHEN insight_type = 'personal' THEN true
      WHEN insight_type = 'department' THEN user_has_role_in(auth.uid(), ARRAY['admin'::user_role, 'manager'::user_role, 'root'::user_role])
      WHEN insight_type = 'organization' THEN user_has_role_in(auth.uid(), ARRAY['admin'::user_role, 'root'::user_role])
      ELSE false
    END
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type_active ON ai_insights(insight_type, is_active);
