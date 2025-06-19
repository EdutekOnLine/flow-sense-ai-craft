
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce memory usage by limiting cache time
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in older versions)
      // Reduce network requests
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Clean up inactive queries periodically
setInterval(() => {
  queryClient.getQueryCache().clear();
}, 30 * 60 * 1000); // Every 30 minutes
