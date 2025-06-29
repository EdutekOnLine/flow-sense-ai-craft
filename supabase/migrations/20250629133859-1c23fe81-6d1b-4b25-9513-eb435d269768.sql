
-- Create CRM Deal Pipeline Analytics View
CREATE OR REPLACE VIEW crm_deal_pipeline_analytics AS
SELECT 
  d.id,
  d.title,
  d.value,
  d.currency,
  d.stage,
  d.probability,
  d.source,
  d.expected_close_date,
  d.actual_close_date,
  d.created_at,
  d.updated_at,
  d.workspace_id,
  d.assigned_to,
  d.created_by,
  CONCAT(p_assigned.first_name, ' ', p_assigned.last_name) as assigned_to_name,
  CONCAT(p_created.first_name, ' ', p_created.last_name) as created_by_name,
  c.first_name || ' ' || c.last_name as contact_name,
  comp.name as company_name,
  CASE 
    WHEN d.stage = 'won' THEN d.value
    ELSE d.value * (d.probability / 100.0)
  END as weighted_value,
  CASE 
    WHEN d.actual_close_date IS NOT NULL THEN 
      (d.actual_close_date::date - d.created_at::date)
    WHEN d.expected_close_date IS NOT NULL THEN 
      (d.expected_close_date::date - d.created_at::date)
    ELSE NULL
  END as days_to_close
FROM crm_deals d
LEFT JOIN profiles p_assigned ON d.assigned_to = p_assigned.id
LEFT JOIN profiles p_created ON d.created_by = p_created.id
LEFT JOIN crm_contacts c ON d.contact_id = c.id
LEFT JOIN companies comp ON d.company_id = comp.id;

-- Create CRM Contact Performance View
CREATE OR REPLACE VIEW crm_contact_performance_view AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.first_name || ' ' || c.last_name as full_name,
  c.email,
  c.phone,
  c.job_title,
  c.department,
  c.status,
  c.lead_source,
  c.lead_score,
  c.last_contact_date,
  c.next_follow_up,
  c.created_at,
  c.updated_at,
  c.workspace_id,
  c.created_by,
  CONCAT(p.first_name, ' ', p.last_name) as created_by_name,
  comp.name as company_name,
  comp.industry as company_industry,
  -- Deal metrics
  COALESCE(deal_stats.total_deals, 0) as total_deals,
  COALESCE(deal_stats.won_deals, 0) as won_deals,
  COALESCE(deal_stats.total_deal_value, 0) as total_deal_value,
  COALESCE(deal_stats.won_deal_value, 0) as won_deal_value,
  -- Task metrics
  COALESCE(task_stats.total_tasks, 0) as total_tasks,
  COALESCE(task_stats.completed_tasks, 0) as completed_tasks,
  CASE 
    WHEN task_stats.total_tasks > 0 THEN 
      (task_stats.completed_tasks::decimal / task_stats.total_tasks * 100)
    ELSE 0
  END as task_completion_rate
FROM crm_contacts c
LEFT JOIN profiles p ON c.created_by = p.id
LEFT JOIN companies comp ON c.company_id = comp.id
LEFT JOIN (
  SELECT 
    contact_id,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
    SUM(value) as total_deal_value,
    SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END) as won_deal_value
  FROM crm_deals 
  WHERE contact_id IS NOT NULL
  GROUP BY contact_id
) deal_stats ON c.id = deal_stats.contact_id
LEFT JOIN (
  SELECT 
    contact_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
  FROM crm_tasks 
  WHERE contact_id IS NOT NULL
  GROUP BY contact_id
) task_stats ON c.id = task_stats.contact_id;

-- Create CRM Sales Performance Analytics View
CREATE OR REPLACE VIEW crm_sales_performance_analytics AS
SELECT 
  p.id as user_id,
  p.first_name || ' ' || p.last_name as full_name,
  p.email,
  p.department,
  p.workspace_id,
  -- Deal metrics
  COALESCE(deal_stats.total_deals, 0) as total_deals,
  COALESCE(deal_stats.won_deals, 0) as won_deals,
  COALESCE(deal_stats.lost_deals, 0) as lost_deals,
  COALESCE(deal_stats.active_deals, 0) as active_deals,
  COALESCE(deal_stats.total_deal_value, 0) as total_deal_value,
  COALESCE(deal_stats.won_deal_value, 0) as won_deal_value,
  COALESCE(deal_stats.pipeline_value, 0) as pipeline_value,
  COALESCE(deal_stats.weighted_pipeline_value, 0) as weighted_pipeline_value,
  -- Conversion rates
  CASE 
    WHEN deal_stats.total_deals > 0 THEN 
      (deal_stats.won_deals::decimal / deal_stats.total_deals * 100)
    ELSE 0
  END as deal_win_rate,
  -- Task metrics
  COALESCE(task_stats.total_tasks, 0) as total_tasks,
  COALESCE(task_stats.completed_tasks, 0) as completed_tasks,
  COALESCE(task_stats.overdue_tasks, 0) as overdue_tasks,
  CASE 
    WHEN task_stats.total_tasks > 0 THEN 
      (task_stats.completed_tasks::decimal / task_stats.total_tasks * 100)
    ELSE 0
  END as task_completion_rate,
  -- Contact metrics
  COALESCE(contact_stats.total_contacts, 0) as total_contacts,
  COALESCE(contact_stats.converted_contacts, 0) as converted_contacts,
  CASE 
    WHEN contact_stats.total_contacts > 0 THEN 
      (contact_stats.converted_contacts::decimal / contact_stats.total_contacts * 100)
    ELSE 0
  END as contact_conversion_rate
FROM profiles p
LEFT JOIN (
  SELECT 
    created_by,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN stage = 'won' THEN 1 END) as won_deals,
    COUNT(CASE WHEN stage = 'lost' THEN 1 END) as lost_deals,
    COUNT(CASE WHEN stage NOT IN ('won', 'lost') THEN 1 END) as active_deals,
    SUM(value) as total_deal_value,
    SUM(CASE WHEN stage = 'won' THEN value ELSE 0 END) as won_deal_value,
    SUM(CASE WHEN stage NOT IN ('won', 'lost') THEN value ELSE 0 END) as pipeline_value,
    SUM(CASE WHEN stage NOT IN ('won', 'lost') THEN value * (probability / 100.0) ELSE 0 END) as weighted_pipeline_value
  FROM crm_deals 
  GROUP BY created_by
) deal_stats ON p.id = deal_stats.created_by
LEFT JOIN (
  SELECT 
    created_by,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_tasks
  FROM crm_tasks 
  GROUP BY created_by
) task_stats ON p.id = task_stats.created_by
LEFT JOIN (
  SELECT 
    created_by,
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN status = 'customer' THEN 1 END) as converted_contacts
  FROM crm_contacts 
  GROUP BY created_by
) contact_stats ON p.id = contact_stats.created_by
WHERE p.role IN ('admin', 'manager', 'employee');
