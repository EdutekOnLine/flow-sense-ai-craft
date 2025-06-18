
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface DashboardRouterProps {
  isMainDashboard: boolean;
  onTabChange: (tabId: string) => void;
  onOpenWorkflow: (workflowId: string) => void;
}

export function useDashboardRouter({ isMainDashboard, onTabChange, onOpenWorkflow }: DashboardRouterProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();

  useEffect(() => {
    // Only set active tab from hash if we're on the main dashboard
    if (isMainDashboard) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveTab(hash);
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [isMainDashboard, location.pathname]);

  // Add hash change listener to handle programmatic navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (isMainDashboard) {
        const hash = window.location.hash.slice(1);
        if (hash) {
          setActiveTab(hash);
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isMainDashboard]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
    onTabChange(tabId);
  };

  const handleOpenWorkflow = (workflowId: string) => {
    console.log('DashboardRouter handleOpenWorkflow called with workflowId:', workflowId);
    
    // First, update the URL with the workflow ID
    const url = new URL(window.location.href);
    url.searchParams.set('workflowId', workflowId);
    window.history.replaceState({}, '', url.toString());
    
    // Then switch to workflow builder tab
    setActiveTab('workflow-builder');
    window.location.hash = 'workflow-builder';
    onOpenWorkflow(workflowId);
  };

  return {
    activeTab,
    handleTabChange,
    handleOpenWorkflow
  };
}
