
import React from 'react';
import { Clock, CheckCircle, PlayCircle } from 'lucide-react';

interface TaskStatusIconProps {
  status: string;
}

export function TaskStatusIcon({ status }: TaskStatusIconProps) {
  switch (status) {
    case 'pending':
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-status-pending to-status-pending/70 rounded-lg flex items-center justify-center">
          <Clock className="h-4 w-4 text-white" />
        </div>
      );
    case 'in_progress':
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-status-active to-status-active/70 rounded-lg flex items-center justify-center">
          <PlayCircle className="h-4 w-4 text-white" />
        </div>
      );
    case 'completed':
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-status-success to-status-success/70 rounded-lg flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted/70 rounded-lg flex items-center justify-center">
          <Clock className="h-4 w-4 text-white" />
        </div>
      );
  }
}
