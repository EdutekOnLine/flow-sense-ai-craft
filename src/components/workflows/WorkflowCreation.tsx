
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function WorkflowCreation() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/?tab=list');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Button>
        <h2 className="text-2xl font-bold">Create Workflow</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Workflow creation functionality has been removed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
