
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, MessageCircle, Share2, Save, Eye, Edit3, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  role: 'owner' | 'editor' | 'viewer';
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies: Comment[];
}

interface CollaborativeReportEditorProps {
  reportId: string;
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function CollaborativeReportEditor({ 
  reportId, 
  initialData,
  onSave 
}: CollaborativeReportEditorProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      isOnline: true,
      lastSeen: 'now',
      role: 'owner'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      isOnline: true,
      lastSeen: 'now',
      role: 'editor'
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      isOnline: false,
      lastSeen: '2 minutes ago',
      role: 'viewer'
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Bob Smith',
      content: 'Should we include more detailed metrics for Q3?',
      timestamp: '5 minutes ago',
      resolved: false,
      replies: []
    }
  ]);

  const [reportTitle, setReportTitle] = useState(initialData?.title || 'Untitled Report');
  const [reportDescription, setReportDescription] = useState(initialData?.description || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSave = () => {
    const reportData = {
      title: reportTitle,
      description: reportDescription,
      lastModified: new Date().toISOString(),
      collaborators: collaborators.length
    };
    
    onSave?.(reportData);
    toast.success('Report saved successfully');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'Current User',
      content: newComment,
      timestamp: 'now',
      resolved: false,
      replies: []
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleShareReport = () => {
    // Copy share link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/reports/shared/${reportId}`);
    toast.success('Share link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header with Collaborators */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="text-2xl font-bold border-none p-0 focus:ring-0"
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{reportTitle}</h1>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <CardDescription className="mt-1">
                Collaborative report editing • {collaborators.length} collaborators
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              {/* Collaborators */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 3).map((collaborator) => (
                      <Tooltip key={collaborator.id}>
                        <TooltipTrigger>
                          <div className="relative">
                            <Avatar className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={collaborator.avatar} />
                              <AvatarFallback>
                                {collaborator.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {collaborator.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{collaborator.name}</p>
                            <p className="text-gray-500">{collaborator.role}</p>
                            <p className="text-xs">
                              {collaborator.isOnline ? 'Online' : `Last seen ${collaborator.lastSeen}`}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
                
                {collaborators.length > 3 && (
                  <Badge variant="secondary">+{collaborators.length - 3}</Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {comments.length}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareReport}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Content</CardTitle>
              <CardDescription>Collaborate in real-time on your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Add a description for your report..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Live Editing Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Auto-saving...</span>
                </div>
                <span>•</span>
                <span>Last saved 2 minutes ago</span>
              </div>

              {/* Report Builder Integration */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="mb-2">Report visualization will appear here</div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <Button size="sm" onClick={handleAddComment} className="w-full">
                    Add Comment
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      {!comment.resolved && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">
                          Mark as resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
