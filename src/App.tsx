
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./components/auth/AuthPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";
import { useEffect, useState } from "react";
import './i18n'; // Initialize i18n

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [hasInviteToken, setHasInviteToken] = useState(false);

  useEffect(() => {
    // Check for invitation token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite');
    console.log('Checking for invitation token in App.tsx:', token);
    console.log('Current URL:', window.location.href);
    setHasInviteToken(!!token);

    // Initialize RTL support based on stored preference
    const storedLanguage = localStorage.getItem('preferred-language');
    const storedDirection = localStorage.getItem('text-direction');
    
    if (storedLanguage && storedDirection) {
      document.documentElement.dir = storedDirection;
      document.documentElement.lang = storedLanguage;
      
      if (storedDirection === 'rtl') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If there's an invite token, ALWAYS show auth page (even if user is logged in)
  if (hasInviteToken) {
    console.log('Found invite token, showing AuthPage');
    return <AuthPage />;
  }

  // If user is not authenticated and no invite token, show auth page
  if (!user) {
    console.log('No user and no invite token, showing AuthPage');
    return <AuthPage />;
  }

  // If user is authenticated and no invite token, show dashboard
  console.log('User authenticated and no invite token, showing Dashboard');
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
