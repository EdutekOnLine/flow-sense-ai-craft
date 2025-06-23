
import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, className = '', duration = 1000 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  useEffect(() => {
    if (typeof value === 'string') {
      setDisplayValue(value);
      return;
    }

    if (typeof value === 'number') {
      let startTime: number;
      const startValue = typeof displayValue === 'number' ? displayValue : 0;
      
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (value - startValue) * easeOutQuart);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}
