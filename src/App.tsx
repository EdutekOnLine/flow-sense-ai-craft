import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import Dashboard from './pages/Dashboard';

function AppContent() {
  return (
    <Dashboard />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
