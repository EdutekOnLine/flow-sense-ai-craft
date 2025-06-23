
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Activity, 
  Users,
  DollarSign,
  FileText,
  BookOpen,
  TrendingUp,
  Target
} from 'lucide-react';
import { MetricCardData } from './types';
import { RandomColorAssignment, generateRandomThemeColors } from '@/utils/themeColorRandomizer';

// Function to get a guaranteed random color set
const getRandomThemeColors = () => {
  const [randomColor] = generateRandomThemeColors(1);
  console.log('🎨 [getRandomThemeColors] Generated fallback color:', randomColor);
  return randomColor;
};

export function buildNeuraFlowMetrics(
  flowMetrics: any, 
  t: (key: string) => string,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: t('dashboard.pendingTasks'),
      value: flowMetrics.pendingTasks,
      icon: Clock
    },
    {
      title: t('dashboard.activeTasks'),
      value: flowMetrics.inProgressTasks,
      icon: PlayCircle
    },
    {
      title: t('dashboard.completedToday'),
      value: flowMetrics.completedTasksToday,
      icon: CheckCircle
    }
  ];

  // Apply random colors with guaranteed fallback
  return cards.map(card => {
    const assignedColors = colorAssignment?.[card.title];
    const finalColors = assignedColors || getRandomThemeColors();
    
    console.log('🎨 [buildNeuraFlowMetrics] Card:', card.title);
    console.log('🎨 [buildNeuraFlowMetrics] Assigned colors:', assignedColors);
    console.log('🎨 [buildNeuraFlowMetrics] Final colors:', finalColors);
    
    return {
      ...card,
      ...finalColors
    };
  });
}

export function buildNeuraCrmMetrics(
  crmMetrics: any,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: 'Total Leads',
      value: crmMetrics.totalLeads,
      icon: Users
    },
    {
      title: 'Active Deals',
      value: crmMetrics.activeDeals,
      icon: Target
    },
    {
      title: 'Monthly Revenue',
      value: crmMetrics.monthlyRevenue,
      icon: DollarSign
    }
  ];

  // Apply random colors with guaranteed fallback
  return cards.map(card => {
    const assignedColors = colorAssignment?.[card.title];
    const finalColors = assignedColors || getRandomThemeColors();
    
    console.log('🎨 [buildNeuraCrmMetrics] Card:', card.title);
    console.log('🎨 [buildNeuraCrmMetrics] Assigned colors:', assignedColors);
    console.log('🎨 [buildNeuraCrmMetrics] Final colors:', finalColors);
    
    if (card.title === 'Active Deals') {
      console.log('🔍 [buildNeuraCrmMetrics] ACTIVE DEALS SPECIFIC DEBUG:');
      console.log('🔍 Color assignment object:', colorAssignment);
      console.log('🔍 Looking for key:', card.title);
      console.log('🔍 Found assignment:', assignedColors);
      console.log('🔍 Using final colors:', finalColors);
    }
    
    return {
      ...card,
      ...finalColors
    };
  });
}

export function buildNeuraFormsMetrics(
  formsMetrics: any,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: 'Form Submissions',
      value: formsMetrics.submissions,
      icon: FileText
    },
    {
      title: 'Active Forms',
      value: formsMetrics.activeForms,
      icon: Activity
    }
  ];

  // Apply random colors with guaranteed fallback
  return cards.map(card => {
    const assignedColors = colorAssignment?.[card.title];
    const finalColors = assignedColors || getRandomThemeColors();
    
    console.log('🎨 [buildNeuraFormsMetrics] Card:', card.title);
    console.log('🎨 [buildNeuraFormsMetrics] Assigned colors:', assignedColors);
    console.log('🎨 [buildNeuraFormsMetrics] Final colors:', finalColors);
    
    return {
      ...card,
      ...finalColors
    };
  });
}

export function buildNeuraEduMetrics(
  eduMetrics: any,
  colorAssignment?: RandomColorAssignment
): MetricCardData[] {
  const cards = [
    {
      title: 'Active Students',
      value: eduMetrics.activeStudents,
      icon: Users
    },
    {
      title: 'Course Completion',
      value: `${eduMetrics.completionRate}%`,
      icon: BookOpen
    }
  ];

  // Apply random colors with guaranteed fallback
  return cards.map(card => {
    const assignedColors = colorAssignment?.[card.title];
    const finalColors = assignedColors || getRandomThemeColors();
    
    console.log('🎨 [buildNeuraEduMetrics] Card:', card.title);
    console.log('🎨 [buildNeuraEduMetrics] Assigned colors:', assignedColors);
    console.log('🎨 [buildNeuraEduMetrics] Final colors:', finalColors);
    
    if (card.title === 'Course Completion') {
      console.log('🔍 [buildNeuraEduMetrics] COURSE COMPLETION SPECIFIC DEBUG:');
      console.log('🔍 Color assignment object:', colorAssignment);
      console.log('🔍 Looking for key:', card.title);
      console.log('🔍 Found assignment:', assignedColors);
      console.log('🔍 Using final colors:', finalColors);
    }
    
    return {
      ...card,
      ...finalColors
    };
  });
}

export function buildFallbackMetrics(colorAssignment?: RandomColorAssignment): MetricCardData[] {
  const cards = [
    {
      title: 'System Status',
      value: 'Online',
      icon: Activity
    },
    {
      title: 'Performance',
      value: '99%',
      icon: TrendingUp
    }
  ];

  // Apply random colors with guaranteed fallback
  return cards.map(card => {
    const assignedColors = colorAssignment?.[card.title];
    const finalColors = assignedColors || getRandomThemeColors();
    
    console.log('🎨 [buildFallbackMetrics] Card:', card.title);
    console.log('🎨 [buildFallbackMetrics] Assigned colors:', assignedColors);
    console.log('🎨 [buildFallbackMetrics] Final colors:', finalColors);
    
    return {
      ...card,
      ...finalColors
    };
  });
}
