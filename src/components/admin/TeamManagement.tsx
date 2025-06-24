
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { CreateTeamDialog } from './team-management/CreateTeamDialog';
import { EditTeamDialog } from './team-management/EditTeamDialog';
import { ManageTeamMembersDialog } from './team-management/ManageTeamMembersDialog';
import { useAuth } from '@/hooks/useAuth';
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

export function TeamManagement() {
  const { profile } = useAuth();
  const {
    teams,
    deleteTeam,
    canManageTeam,
    getTeamMembers,
    isLoading,
    isDeleting,
  } = useTeamManagement();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [manageMembersTeamId, setManageMembersTeamId] = useState<string | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'root';

  const handleDeleteTeam = () => {
    if (deleteTeamId) {
      deleteTeam(deleteTeamId);
      setDeleteTeamId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage teams and their members within your workspace
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {team.member_count || 0}
                </Badge>
              </div>
              {team.description && (
                <p className="text-sm text-muted-foreground">{team.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Manager</p>
                <p className="text-sm text-muted-foreground">
                  {team.manager ? 
                    `${team.manager.first_name} ${team.manager.last_name}` : 
                    'No manager assigned'
                  }
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManageMembersTeamId(team.id)}
                  className="flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Members
                </Button>
                
                {canManageTeam(team.id) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditTeamId(team.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTeamId(team.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </div>

              {(team.member_count || 0) > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Team Members</p>
                  <div className="flex flex-wrap gap-1">
                    {getTeamMembers(team.id).slice(0, 3).map((member) => (
                      <Badge key={member.id} variant="outline" className="text-xs">
                        {member.user?.first_name} {member.user?.last_name}
                      </Badge>
                    ))}
                    {(team.member_count || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(team.member_count || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {teams.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first team.
            </p>
            {isAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {editTeamId && (
        <EditTeamDialog
          teamId={editTeamId}
          open={!!editTeamId}
          onOpenChange={() => setEditTeamId(null)}
        />
      )}

      {manageMembersTeamId && (
        <ManageTeamMembersDialog
          teamId={manageMembersTeamId}
          open={!!manageMembersTeamId}
          onOpenChange={() => setManageMembersTeamId(null)}
        />
      )}

      <AlertDialog open={!!deleteTeamId} onOpenChange={() => setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be undone and will remove all team memberships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
