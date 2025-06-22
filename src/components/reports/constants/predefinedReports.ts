
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity, 
  Calendar,
  Workflow,
  Building2,
  GraduationCap,
  Settings
} from 'lucide-react';

export interface PredefinedReport {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredModules: string[];
  dataSource: string;
  icon: React.ComponentType<any>;
  isPopular?: boolean;
}

export const MODULE_REPORTS: PredefinedReport[] = [
  // NeuraFlow Reports
  {
    id: 'workflow-performance-dashboard',
    name: 'Workflow Performance Dashboard',
    description: 'Comprehensive overview of workflow completion rates, timing, and efficiency metrics',
    category: 'Workflow Management',
    requiredModules: ['neura-flow'],
    dataSource: 'workflow_performance',
    icon: Workflow,
    isPopular: true
  },
  {
    id: 'task-completion-trends',
    name: 'Task Completion Trends',
    description: 'Historical analysis of task completion patterns and bottlenecks',
    category: 'Workflow Management',
    requiredModules: ['neura-flow'],
    dataSource: 'workflow_trends',
    icon: TrendingUp
  },
  {
    id: 'workflow-step-analysis',
    name: 'Workflow Step Analysis',
    description: 'Detailed breakdown of individual workflow steps and their performance',
    category: 'Workflow Management',
    requiredModules: ['neura-flow'],
    dataSource: 'workflow_steps',
    icon: Activity
  },
  // NeuraCRM Reports
  {
    id: 'department-performance',
    name: 'Department Performance Analytics',
    description: 'Compare performance metrics across different departments and teams',
    category: 'Customer Management',
    requiredModules: ['neura-crm'],
    dataSource: 'department_analytics',
    icon: Building2,
    isPopular: true
  },
  {
    id: 'user-engagement-analysis',
    name: 'User Engagement Analysis',
    description: 'Track user activity patterns and engagement levels across the platform',
    category: 'Customer Management',
    requiredModules: ['neura-crm'],
    dataSource: 'profiles',
    icon: Users
  },
  // NeuraForms Reports
  {
    id: 'form-submission-analytics',
    name: 'Form Submission Analytics',
    description: 'Analyze form submission rates, completion times, and user behavior',
    category: 'Forms & Data Collection',
    requiredModules: ['neura-forms'],
    dataSource: 'workflow_steps',
    icon: FileText
  },
  {
    id: 'response-rate-analysis',
    name: 'Response Rate Analysis',
    description: 'Track response rates and identify opportunities for improvement',
    category: 'Forms & Data Collection',
    requiredModules: ['neura-forms'],
    dataSource: 'notifications',
    icon: BarChart3
  },
  // NeuraEdu Reports
  {
    id: 'student-progress-dashboard',
    name: 'Student Progress Dashboard',
    description: 'Monitor individual and group learning progress and achievements',
    category: 'Education & Learning',
    requiredModules: ['neura-edu'],
    dataSource: 'user_performance_analytics',
    icon: GraduationCap,
    isPopular: true
  },
  {
    id: 'course-completion-analytics',
    name: 'Course Completion Analytics',
    description: 'Track course completion rates and identify learning patterns',
    category: 'Education & Learning',
    requiredModules: ['neura-edu'],
    dataSource: 'workflow_performance',
    icon: Calendar
  },
  // Core Reports (always available)
  {
    id: 'system-notifications-report',
    name: 'System Notifications Report',
    description: 'Overview of system notifications, alerts, and communication patterns',
    category: 'System Analytics',
    requiredModules: ['neura-core'],
    dataSource: 'notifications',
    icon: Settings
  }
];
