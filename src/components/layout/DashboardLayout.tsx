import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkflowPermissions } from '@/hooks/useWorkflowPermissions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Workflow, 
  Users, 
  BarChart3, 
  Settings, 
  Menu,
  LogOut,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { canViewUsers, canCreateWorkflows } = useWorkflowPermissions();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: t('navigation.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('navigation.myTasks'), href: '/tasks', icon: CheckSquare },
    ...(canCreateWorkflows ? [{ name: t('navigation.workflowBuilder'), href: '/workflow-builder', icon: Workflow }] : []),
    ...(canViewUsers ? [{ name: t('navigation.users'), href: '/users', icon: Users }] : []),
    { name: t('navigation.reports'), href: '/reports', icon: BarChart3 },
    { name: t('navigation.settings'), href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const NavLinks = ({ mobile = false }) => (
    <nav className={cn("space-y-2", mobile && "px-4")}>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setSidebarOpen(false)}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">WorkFlow</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 px-4">
            <NavLinks />
          </div>

          <div className="flex-shrink-0 p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <LanguageSwitcher />
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center px-4 py-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold">WorkFlow</h1>
                        <p className="text-xs text-muted-foreground">Management System</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 py-4">
                    <NavLinks mobile />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Workflow className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">WorkFlow</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <NotificationCenter />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || ""} />
                    <AvatarFallback>
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {profile?.first_name} {profile?.last_name}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-6 lg:py-4 lg:border-b lg:border-border lg:bg-card">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {t('header.welcome', { name: profile?.first_name || 'User' })}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || ""} />
                    <AvatarFallback>
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {profile?.first_name} {profile?.last_name}
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
