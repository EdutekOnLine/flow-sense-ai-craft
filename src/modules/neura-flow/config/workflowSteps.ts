
import {
  PlayCircle,
  Clock,
  Send,
  Database,
  GitBranch,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calculator,
  Timer,
  Bell,
  Mail,
  Webhook,
  Bot,
  Filter,
  MapPin,
  Calendar,
  Users,
  Building,
  CreditCard,
  UserCheck,
  FileCheck,
  MessageSquare,
  Phone,
  Zap,
  Settings,
  Archive,
  Trash2,
  RotateCcw,
  Pause,
  Square,
  Copy,
  Edit,
  Eye,
  Download,
  Upload,
  Share2,
  Lock,
  Unlock,
  Tag,
  Bookmark,
  Search,
  SortAsc,
  SortDesc,
  Hash,
  Type,
  ToggleLeft,
  Shuffle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Star,
  Heart,
  ThumbsUp,
  Flag,
  MessageCircle,
  HelpCircle,
  Info,
  AlertCircle,
  CheckSquare,
  Plus,
  Minus,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Power,
  Wifi,
  WifiOff,
  CloudUpload,
  CloudDownload,
  Compass,
  Navigation,
  Map,
  Globe,
  Link,
  ExternalLink,
  Home,
  Briefcase,
  ShoppingCart,
  Package,
  Truck,
  Plane,
  Train,
  Car,
  Bike,
  Coffee,
  Utensils,
  Music,
  Image,
  Video,
  Headphones,
  Camera,
  Printer,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Battery,
  BatteryLow,
  Lightbulb,
  Flashlight,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Umbrella,
  Thermometer,
  Wind,
  Waves,
  Mountain,
  Trees,
  Flower,
  Leaf,
  Feather,
  Shell,
  Bug,
  Fish,
  Bird,
} from 'lucide-react';

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  icon: any;
  stepType: string;
  category: 'triggers' | 'actions' | 'conditions' | 'utilities';
}

export function getWorkflowSteps(t: any) {
  return {
    triggers: [
      {
        id: 'manual-trigger',
        label: t('workflowBuilder.steps.manualTrigger'),
        description: t('workflowBuilder.steps.manualTriggerDesc'),
        icon: PlayCircle,
        stepType: 'trigger',
        category: 'triggers' as const,
      },
      {
        id: 'schedule-trigger',
        label: t('workflowBuilder.steps.scheduleTrigger'),
        description: t('workflowBuilder.steps.scheduleTriggerDesc'),
        icon: Clock,
        stepType: 'schedule',
        category: 'triggers' as const,
      },
      {
        id: 'webhook-trigger',
        label: t('workflowBuilder.steps.webhookTrigger'),
        description: t('workflowBuilder.steps.webhookTriggerDesc'),
        icon: Webhook,
        stepType: 'webhook',
        category: 'triggers' as const,
      },
    ],
    actions: [
      {
        id: 'send-email',
        label: t('workflowBuilder.steps.sendEmail'),
        description: t('workflowBuilder.steps.sendEmailDesc'),
        icon: Mail,
        stepType: 'email',
        category: 'actions' as const,
      },
      {
        id: 'send-notification',
        label: t('workflowBuilder.steps.sendNotification'),
        description: t('workflowBuilder.steps.sendNotificationDesc'),
        icon: Bell,
        stepType: 'notification',
        category: 'actions' as const,
      },
      {
        id: 'create-record',
        label: t('workflowBuilder.steps.createRecord'),
        description: t('workflowBuilder.steps.createRecordDesc'),
        icon: Database,
        stepType: 'create_record',
        category: 'actions' as const,
      },
      {
        id: 'update-record',
        label: t('workflowBuilder.steps.updateRecord'),
        description: t('workflowBuilder.steps.updateRecordDesc'),
        icon: Edit,
        stepType: 'update_record',
        category: 'actions' as const,
      },
      {
        id: 'assign-task',
        label: t('workflowBuilder.steps.assignTask'),
        description: t('workflowBuilder.steps.assignTaskDesc'),
        icon: UserCheck,
        stepType: 'assign_task',
        category: 'actions' as const,
      },
    ],
    conditions: [
      {
        id: 'if-condition',
        label: t('workflowBuilder.steps.ifCondition'),
        description: t('workflowBuilder.steps.ifConditionDesc'),
        icon: GitBranch,
        stepType: 'condition',
        category: 'conditions' as const,
      },
      {
        id: 'approval',
        label: t('workflowBuilder.steps.approval'),
        description: t('workflowBuilder.steps.approvalDesc'),
        icon: CheckCircle,
        stepType: 'approval',
        category: 'conditions' as const,
      },
    ],
    utilities: [
      {
        id: 'delay',
        label: t('workflowBuilder.steps.delay'),
        description: t('workflowBuilder.steps.delayDesc'),
        icon: Timer,
        stepType: 'delay',
        category: 'utilities' as const,
      },
      {
        id: 'log',
        label: t('workflowBuilder.steps.log'),
        description: t('workflowBuilder.steps.logDesc'),
        icon: FileText,
        stepType: 'log',
        category: 'utilities' as const,
      },
    ],
  };
}

export function getIconBackgroundColor(stepType: string): string {
  switch (stepType) {
    case 'trigger':
    case 'schedule':
    case 'webhook':
      return 'bg-primary/10';
    case 'email':
    case 'notification':
    case 'create_record':
    case 'update_record':
    case 'assign_task':
      return 'bg-secondary/10';
    case 'condition':
    case 'approval':
      return 'bg-accent/10';
    case 'delay':
    case 'log':
      return 'bg-muted/10';
    default:
      return 'bg-gray-100';
  }
}

export function getIconColor(stepType: string): string {
  switch (stepType) {
    case 'trigger':
    case 'schedule':
    case 'webhook':
      return 'text-primary';
    case 'email':
    case 'notification':
    case 'create_record':
    case 'update_record':
    case 'assign_task':
      return 'text-secondary';
    case 'condition':
    case 'approval':
      return 'text-accent';
    case 'delay':
    case 'log':
      return 'text-muted-foreground';
    default:
      return 'text-gray-600';
  }
}
