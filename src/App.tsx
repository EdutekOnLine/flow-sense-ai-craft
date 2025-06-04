
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
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [hasInviteToken, setHasInviteToken] = useState(false);
  const [appState, setAppState] = useState('initializing');

  console.log('=== APP CONTENT DEBUG ===');
  console.log('App.tsx - User:', user?.id);
  console.log('App.tsx - Loading:', loading);
  console.log('App.tsx - hasInviteToken:', hasInviteToken);
  console.log('App.tsx - appState:', appState);

  useEffect(() => {
    console.log('=== APP CONTENT USEEFFECT ===');
    // Check for invitation token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invite');
    console.log('Checking for invitation token in App.tsx:', token);
    console.log('Current URL:', window.location.href);
    setHasInviteToken(!!token);
    
    if (loading) {
      setAppState('loading auth');
    } else if (token) {
      setAppState('has invite token');
    } else if (!user) {
      setAppState('no user');
    } else {
      setAppState('authenticated');
    }
  }, [loading, user]);

  console.log('=== APP RENDER DECISION ===');
  console.log('Will render based on state:', appState);

  if (loading) {
    console.log('App showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-lg font-medium">Loading NeuraFlow...</div>
          <div className="text-sm text-gray-500 mt-2">Initializing application</div>
        </div>
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
  console.log('User authenticated and no invite token, showing Dashboard Routes');
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  console.log('=== APP COMPONENT RENDERED ===');
  console.log('Current timestamp:', new Date().toISOString());
  
  return (
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
};

export default App;
