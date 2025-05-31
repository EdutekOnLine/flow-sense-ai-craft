
import React, { useState } from 'react';
import { Clock, CheckCircle, PlayCircle, XCircle, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowAssignments } from '@/hooks/useWorkflowAssignments';
import { formatDistanceToNow } from 'date-fns';

type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export function WorkflowInbox() {
  const { assignments, isLoading, updateAssignmentStatus } = useWorkflowAssignments();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'skipped':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: AssignmentStatus) => {
    if (!selectedAssignment) return;
    
    await updateAssignmentStatus(selectedAssignment.id, newStatus, notes);
    setSelectedAssignment(null);
    setNotes('');
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (statusFilter === 'all') return true;
    return assignment.status === statusFilter;
  });

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const inProgressCount = assignments.filter(a => a.status === 'in_progress').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Inbox</h2>
          <p className="text-gray-600">Manage your assigned workflow steps</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {pendingCount} Pending
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {inProgressCount} In Progress
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? "You don't have any workflow assignments yet."
                  : `No assignments with status "${statusFilter}".`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {assignment.workflow_steps.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Workflow: {assignment.workflow_steps.workflows.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(assignment.status)}
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.workflow_steps.description && (
                  <p className="text-sm text-gray-700">
                    {assignment.workflow_steps.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Assigned {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                  </div>
                  {assignment.due_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                    </div>
                  )}
                </div>

                {assignment.notes && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{assignment.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setNotes(assignment.notes || '');
                        }}
                      >
                        Update Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Assignment Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <h4 className="font-medium mb-2">Step: {selectedAssignment?.workflow_steps.name}</h4>
                          <p className="text-sm text-gray-600">
                            Workflow: {selectedAssignment?.workflow_steps.workflows.name}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes (optional)</label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this step..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 hover:bg-blue-100"
                            onClick={() => handleStatusUpdate('in_progress')}
                          >
                            Start Working
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate('completed')}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusUpdate('skipped')}
                          >
                            Skip
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
