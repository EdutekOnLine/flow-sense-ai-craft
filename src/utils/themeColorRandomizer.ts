
interface ThemeColorSet {
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface RandomColorAssignment {
  [key: string]: ThemeColorSet;
}

// Simple seeded random number generator
function seededRandom(seed: number): () => number {
  let state = seed;
  return function() {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

export function generateRandomThemeColors(count: number, seed?: number): ThemeColorSet[] {
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

  // Use seeded random if seed is provided, otherwise use Math.random
  const random = seed ? seededRandom(seed) : Math.random;
  
  // Shuffle the array using seeded randomization
  const shuffled = [...themeColorSets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return the requested number of colors, cycling through if needed
  const result: ThemeColorSet[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  
  console.log('🎨 [generateRandomThemeColors] Generated', count, 'colors with seed:', seed);
  console.log('🎨 [generateRandomThemeColors] Result:', result);
  
  return result;
}

export function createRandomColorAssignment(cardTitles: string[], seed?: number): RandomColorAssignment {
  console.log('🎨 [createRandomColorAssignment] Creating assignment for titles:', cardTitles);
  console.log('🎨 [createRandomColorAssignment] Using seed:', seed);
  
  const colors = generateRandomThemeColors(cardTitles.length, seed);
  const assignment: RandomColorAssignment = {};
  
  cardTitles.forEach((title, index) => {
    assignment[title] = colors[index];
    console.log('🎨 [createRandomColorAssignment] Assigned to', title, ':', colors[index]);
  });
  
  console.log('🎨 [createRandomColorAssignment] Final assignment:', assignment);
  
  return assignment;
}
