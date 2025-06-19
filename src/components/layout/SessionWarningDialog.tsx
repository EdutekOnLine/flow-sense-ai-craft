
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

interface SessionWarningDialogProps {
  onExtendSession: () => void;
  onSignOut: () => void;
}

export function SessionWarningDialog({ onExtendSession, onSignOut }: SessionWarningDialogProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onSignOut]);

  const handleExtendSession = () => {
    onExtendSession();
    setIsOpen(false);
  };

  const handleSignOut = () => {
    onSignOut();
    setIsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Your session will expire due to inactivity. You will be automatically 
                signed out in:
              </p>
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-amber-600">
                  {formatTime(countdown)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Stay Signed In" to extend your session, or "Sign Out" to 
                sign out now.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleExtendSession} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
