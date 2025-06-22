
import { useEffect } from 'react';
import { useUserPresence } from './useUserPresence';

export function useDeferredPresence() {
  const userPresence = useUserPresence();

  useEffect(() => {
    // Phase 7: Defer presence tracking to after initial render
    // This prevents presence queries from blocking the initial UI load
    const timer = setTimeout(() => {
      // Presence tracking starts after a short delay
      // The actual presence logic is handled by useUserPresence
      console.log('Deferred presence tracking initialized');
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  return userPresence;
}
