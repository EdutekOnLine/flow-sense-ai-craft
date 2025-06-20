
import { ReactNode } from 'react';
import { useModuleGuard } from '@/hooks/useModuleGuard';
import { ModuleGuardLoading } from './ModuleGuardLoading';
import { ModuleAccessDeniedCard } from './ModuleAccessDeniedCard';

interface ModuleGuardProps {
  moduleName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showDetailedStatus?: boolean;
  redirectPath?: string;
}

export function ModuleGuard({ 
  moduleName, 
  children, 
  fallback, 
  showDetailedStatus = true,
  redirectPath = '/'
}: ModuleGuardProps) {
  const {
    isLoading,
    hasAccess,
    moduleStatus,
    displayName,
    isOnline,
    canManageModules,
    handleRetry
  } = useModuleGuard(moduleName);

  // Show loading while auth is loading or while checking access
  if (isLoading) {
    return <ModuleGuardLoading />;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const handleGoBack = () => {
    window.history.length > 1 ? window.history.back() : window.location.replace(redirectPath);
  };

  const handleManageModules = () => {
    window.location.hash = 'settings';
  };

  return (
    <ModuleAccessDeniedCard
      displayName={displayName}
      moduleStatus={moduleStatus}
      isOnline={isOnline}
      showDetailedStatus={showDetailedStatus}
      canManageModules={canManageModules}
      onGoBack={handleGoBack}
      onRetry={handleRetry}
      onManageModules={handleManageModules}
    />
  );
}
