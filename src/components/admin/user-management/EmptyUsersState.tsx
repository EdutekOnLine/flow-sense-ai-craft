
import React from 'react';
import { Users } from 'lucide-react';

interface EmptyUsersStateProps {
  isRootUser: boolean;
}

export function EmptyUsersState({ isRootUser }: EmptyUsersStateProps) {
  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No users found</h3>
      <p className="text-muted-foreground">
        {isRootUser 
          ? 'No users are currently registered on the platform.'
          : 'No users found in your workspace.'
        }
      </p>
    </div>
  );
}
