
interface ThemeColorSet {
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface RandomColorAssignment {
  [key: string]: ThemeColorSet;
}

export function generateRandomThemeColors(count: number): ThemeColorSet[] {
  // Define available theme color combinations
  const themeColorSets: ThemeColorSet[] = [
    {
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20'
    },
    {
      color: 'text-secondary',
      bgColor: 'bg-secondary/5',
      borderColor: 'border-secondary/20'
    },
    {
      color: 'text-accent',
      bgColor: 'bg-accent/5',
      borderColor: 'border-accent/20'
    },
    {
      color: 'text-module-accent-1',
      bgColor: 'bg-module-accent-1',
      borderColor: 'border-module-accent-1'
    },
    {
      color: 'text-module-accent-2',
      bgColor: 'bg-module-accent-2',
      borderColor: 'border-module-accent-2'
    },
    {
      color: 'text-module-accent-3',
      bgColor: 'bg-module-accent-3',
      borderColor: 'border-module-accent-3'
    },
    {
      color: 'text-module-accent-4',
      bgColor: 'bg-module-accent-4',
      borderColor: 'border-module-accent-4'
    },
    {
      color: 'text-status-pending',
      bgColor: 'bg-status-pending-bg',
      borderColor: 'border-theme-primary'
    },
    {
      color: 'text-status-active',
      bgColor: 'bg-status-active-bg',
      borderColor: 'border-theme-secondary'
    },
    {
      color: 'text-status-success',
      bgColor: 'bg-status-success-bg',
      borderColor: 'border-theme-accent'
    }
  ];

  // Shuffle the array to randomize order
  const shuffled = [...themeColorSets].sort(() => Math.random() - 0.5);
  
  // Return the requested number of colors, cycling through if needed
  const result: ThemeColorSet[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  
  return result;
}

export function createRandomColorAssignment(cardTitles: string[]): RandomColorAssignment {
  const colors = generateRandomThemeColors(cardTitles.length);
  const assignment: RandomColorAssignment = {};
  
  cardTitles.forEach((title, index) => {
    assignment[title] = colors[index];
  });
  
  return assignment;
}
